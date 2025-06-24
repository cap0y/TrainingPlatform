import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function deleteSeminarsWithCascade() {
  try {
    await client.connect();
    
    // 삭제 전 데이터 확인
    const beforeEnrollments = await client.query(`
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.type = 'seminar' OR c.category = '세미나'
    `);
    console.log('\n삭제 전 세미나 등록 수:', beforeEnrollments.rows[0].count);
    
    const beforeCourses = await client.query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('삭제 전 세미나 수:', beforeCourses.rows[0].count);
    
    // 마이그레이션 SQL 파일 읽기 및 실행
    const sql = fs.readFileSync('./migrations/delete_seminars_cascade.sql', 'utf8');
    await client.query(sql);
    console.log('\n세미나 데이터 삭제 완료');
    
    // 삭제 후 데이터 확인
    const afterEnrollments = await client.query(`
      SELECT COUNT(*) as count 
      FROM enrollments e
      JOIN courses c ON e.course_id = c.id
      WHERE c.type = 'seminar' OR c.category = '세미나'
    `);
    console.log('\n삭제 후 세미나 등록 수:', afterEnrollments.rows[0].count);
    
    const afterCourses = await client.query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('삭제 후 세미나 수:', afterCourses.rows[0].count);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

deleteSeminarsWithCascade(); 