import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech',
  database: 'neondb',
  user: 'neondb_owner',
  password: 'npg_7nwBviZQqC0p',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function checkTables() {
  try {
    await client.connect();
    
    // 테이블 목록 조회
    console.log('=== 테이블 목록 ===');
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log(tables.rows);

    // enrollment_progress 테이블 구조 확인
    console.log('\n=== enrollment_progress 테이블 구조 ===');
    const tableInfo = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'enrollment_progress'
    `);
    console.log(tableInfo.rows);

  } catch (err) {
    console.error('Error checking tables:', err);
  } finally {
    await client.end();
  }
}

checkTables(); 