import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function runMigration() {
  try {
    await client.connect();
    
    // 마이그레이션 SQL 파일 읽기
    const sql = fs.readFileSync('./migrations/add_type_to_enrollments.sql', 'utf8');
    
    // 마이그레이션 실행
    await client.query(sql);
    console.log('Migration completed successfully');
    
    // 결과 확인
    const enrollmentsSchemaResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'enrollments'
    `);
    console.log('\nUpdated enrollments table schema:', enrollmentsSchemaResult.rows);
    
    const enrollmentsResult = await client.query('SELECT * FROM enrollments LIMIT 5');
    console.log('\nUpdated enrollments sample:', enrollmentsResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

runMigration(); 