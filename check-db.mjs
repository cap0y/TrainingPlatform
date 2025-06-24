import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function checkDatabase() {
  try {
    await client.connect();
    
    // 과정 타입 조회
    const courseTypesResult = await client.query('SELECT DISTINCT type FROM courses');
    console.log('Course types:', courseTypesResult.rows);
    
    // enrollments 테이블 구조 확인
    const enrollmentsSchemaResult = await client.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'enrollments'
    `);
    console.log('\nEnrollments table schema:', enrollmentsSchemaResult.rows);
    
    // enrollments 데이터 샘플 확인
    const enrollmentsResult = await client.query('SELECT * FROM enrollments LIMIT 5');
    console.log('\nEnrollments sample:', enrollmentsResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkDatabase(); 