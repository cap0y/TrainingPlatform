const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = 'postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require';

async function backupDatabase() {
  const client = new Client({ connectionString: DATABASE_URL, ssl: { rejectUnauthorized: false } });
  
  try {
    await client.connect();
    console.log('✅ 데이터베이스 연결 성공');

    // 1. 모든 테이블 목록 조회
    const tablesResult = await client.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `);
    const tables = tablesResult.rows.map(r => r.table_name);
    console.log(`📋 발견된 테이블: ${tables.length}개 - [${tables.join(', ')}]`);

    let backupSQL = '';
    
    // 헤더
    backupSQL += `-- ============================================\n`;
    backupSQL += `-- Neon PostgreSQL Database Backup\n`;
    backupSQL += `-- Database: neondb\n`;
    backupSQL += `-- Date: ${new Date().toISOString()}\n`;
    backupSQL += `-- ============================================\n\n`;

    // 2. 시퀀스 백업
    const seqResult = await client.query(`
      SELECT sequence_name, start_value, increment, minimum_value, maximum_value
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public';
    `);
    if (seqResult.rows.length > 0) {
      backupSQL += `-- ============================================\n`;
      backupSQL += `-- SEQUENCES\n`;
      backupSQL += `-- ============================================\n\n`;
      for (const seq of seqResult.rows) {
        const currVal = await client.query(`SELECT last_value FROM "${seq.sequence_name}";`);
        backupSQL += `CREATE SEQUENCE IF NOT EXISTS "${seq.sequence_name}" START ${currVal.rows[0].last_value};\n`;
      }
      backupSQL += '\n';
    }

    // 3. ENUM 타입 백업
    const enumResult = await client.query(`
      SELECT t.typname AS enum_name, 
             string_agg(e.enumlabel, ', ' ORDER BY e.enumsortorder) AS enum_values
      FROM pg_type t 
      JOIN pg_enum e ON t.oid = e.enumtypid 
      JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
      WHERE n.nspname = 'public'
      GROUP BY t.typname;
    `);
    if (enumResult.rows.length > 0) {
      backupSQL += `-- ============================================\n`;
      backupSQL += `-- ENUM TYPES\n`;
      backupSQL += `-- ============================================\n\n`;
      for (const en of enumResult.rows) {
        const values = en.enum_values.split(', ').map(v => `'${v}'`).join(', ');
        backupSQL += `DO $$ BEGIN\n  CREATE TYPE "${en.enum_name}" AS ENUM (${values});\nEXCEPTION WHEN duplicate_object THEN null;\nEND $$;\n\n`;
      }
    }

    // 4. 각 테이블의 DDL(구조) 백업
    backupSQL += `-- ============================================\n`;
    backupSQL += `-- TABLE STRUCTURES\n`;
    backupSQL += `-- ============================================\n\n`;

    for (const table of tables) {
      // 컬럼 정보 조회
      const colsResult = await client.query(`
        SELECT column_name, data_type, udt_name, character_maximum_length, 
               column_default, is_nullable, numeric_precision, numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position;
      `, [table]);

      backupSQL += `-- Table: ${table}\n`;
      backupSQL += `CREATE TABLE IF NOT EXISTS "${table}" (\n`;
      
      const colDefs = colsResult.rows.map(col => {
        let typeName = col.data_type;
        if (col.data_type === 'USER-DEFINED') {
          typeName = `"${col.udt_name}"`;
        } else if (col.data_type === 'character varying') {
          typeName = col.character_maximum_length ? `varchar(${col.character_maximum_length})` : 'varchar';
        } else if (col.data_type === 'numeric') {
          typeName = col.numeric_precision ? `numeric(${col.numeric_precision},${col.numeric_scale || 0})` : 'numeric';
        } else if (col.data_type === 'ARRAY') {
          typeName = `${col.udt_name.replace(/^_/, '')}[]`;
        }
        
        let def = `  "${col.column_name}" ${typeName}`;
        if (col.column_default) def += ` DEFAULT ${col.column_default}`;
        if (col.is_nullable === 'NO') def += ' NOT NULL';
        return def;
      });
      
      // Primary Key
      const pkResult = await client.query(`
        SELECT kcu.column_name
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu 
          ON tc.constraint_name = kcu.constraint_name
        WHERE tc.table_name = $1 AND tc.constraint_type = 'PRIMARY KEY'
        ORDER BY kcu.ordinal_position;
      `, [table]);
      
      if (pkResult.rows.length > 0) {
        const pkCols = pkResult.rows.map(r => `"${r.column_name}"`).join(', ');
        colDefs.push(`  PRIMARY KEY (${pkCols})`);
      }

      backupSQL += colDefs.join(',\n') + '\n);\n\n';
    }

    // 5. 인덱스 백업
    const indexResult = await client.query(`
      SELECT indexdef FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND indexname NOT LIKE '%_pkey'
      ORDER BY tablename, indexname;
    `);
    if (indexResult.rows.length > 0) {
      backupSQL += `-- ============================================\n`;
      backupSQL += `-- INDEXES\n`;
      backupSQL += `-- ============================================\n\n`;
      for (const idx of indexResult.rows) {
        backupSQL += `${idx.indexdef};\n`;
      }
      backupSQL += '\n';
    }

    // 6. Foreign Key 조회 (데이터 삽입 후 마지막에 추가하기 위해 미리 조회)
    const fkResult = await client.query(`
      SELECT 
        tc.constraint_name,
        tc.table_name,
        kcu.column_name,
        ccu.table_name AS foreign_table_name,
        ccu.column_name AS foreign_column_name
      FROM information_schema.table_constraints AS tc
      JOIN information_schema.key_column_usage AS kcu
        ON tc.constraint_name = kcu.constraint_name
      JOIN information_schema.constraint_column_usage AS ccu
        ON ccu.constraint_name = tc.constraint_name
      WHERE tc.constraint_type = 'FOREIGN KEY' AND tc.table_schema = 'public';
    `);

    // 7. 데이터 백업 (INSERT 문) - FK보다 먼저 삽입해야 참조 무결성 에러 방지
    backupSQL += `-- ============================================\n`;
    backupSQL += `-- DATA\n`;
    backupSQL += `-- ============================================\n\n`;

    let totalRows = 0;
    for (const table of tables) {
      const dataResult = await client.query(`SELECT * FROM "${table}";`);
      
      if (dataResult.rows.length === 0) {
        backupSQL += `-- Table "${table}": 0 rows (empty)\n\n`;
        continue;
      }

      backupSQL += `-- Table "${table}": ${dataResult.rows.length} rows\n`;
      const columns = dataResult.fields.map(f => `"${f.name}"`).join(', ');
      
      for (const row of dataResult.rows) {
        const values = dataResult.fields.map(f => {
          const val = row[f.name];
          if (val === null || val === undefined) return 'NULL';
          if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
          if (typeof val === 'number') return val.toString();
          if (val instanceof Date) return `'${val.toISOString()}'`;
          if (typeof val === 'object') return `'${JSON.stringify(val).replace(/'/g, "''")}'`;
          return `'${String(val).replace(/'/g, "''")}'`;
        });
        backupSQL += `INSERT INTO "${table}" (${columns}) VALUES (${values.join(', ')});\n`;
      }
      backupSQL += '\n';
      totalRows += dataResult.rows.length;
      console.log(`  📦 ${table}: ${dataResult.rows.length} rows`);
    }

    // 8. Foreign Key 백업 (데이터 삽입 후 마지막에 추가)
    if (fkResult.rows.length > 0) {
      backupSQL += `-- ============================================\n`;
      backupSQL += `-- FOREIGN KEYS (데이터 삽입 후 마지막에 추가)\n`;
      backupSQL += `-- ============================================\n\n`;
      for (const fk of fkResult.rows) {
        backupSQL += `ALTER TABLE "${fk.table_name}" ADD CONSTRAINT "${fk.constraint_name}" `;
        backupSQL += `FOREIGN KEY ("${fk.column_name}") REFERENCES "${fk.foreign_table_name}"("${fk.foreign_column_name}");\n`;
      }
      backupSQL += '\n';
    }

    // 백업 파일 저장
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive: true });
    
    const backupFile = path.join(backupDir, `neondb_backup_${timestamp}.sql`);
    fs.writeFileSync(backupFile, backupSQL, 'utf8');
    
    const fileSizeMB = (Buffer.byteLength(backupSQL, 'utf8') / 1024 / 1024).toFixed(2);
    
    console.log(`\n✅ 백업 완료!`);
    console.log(`📁 파일: ${backupFile}`);
    console.log(`📊 총 테이블: ${tables.length}개, 총 행: ${totalRows}개`);
    console.log(`💾 파일 크기: ${fileSizeMB} MB`);

  } catch (err) {
    console.error('❌ 백업 실패:', err.message);
  } finally {
    await client.end();
  }
}

backupDatabase();

