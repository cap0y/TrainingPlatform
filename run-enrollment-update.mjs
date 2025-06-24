import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function runUpdate() {
  try {
    await client.connect();
    
    // SQL 파일 읽기
    const sql = fs.readFileSync('./migrations/update_seminar_enrollment.sql', 'utf8');
    
    // 업데이트 실행
    await client.query(sql);
    console.log('Enrollment update completed successfully');
    
    // 결과 확인
    const enrollmentResult = await client.query(`
      SELECT e.*, c.title, c.type as course_type
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.type = 'seminar'
    `);
    console.log('\nUpdated seminar enrollments:', enrollmentResult.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

runUpdate(); 