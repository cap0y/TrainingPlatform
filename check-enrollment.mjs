import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function checkEnrollment() {
  try {
    await client.connect();
    
    // 세미나 2번에 대한 등록 정보 확인
    const enrollmentResult = await client.query(`
      SELECT e.*, c.title, c.type as course_type
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE e.course_id = 2
    `);
    console.log('\nSeminar enrollment:', enrollmentResult.rows);
    
    // 세미나 2번 정보 확인
    const seminarResult = await client.query('SELECT * FROM seminars WHERE id = 2');
    console.log('\nSeminar info:', seminarResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkEnrollment(); 