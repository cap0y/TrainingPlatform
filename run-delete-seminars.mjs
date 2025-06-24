import pg from 'pg';
import fs from 'fs';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function deleteSeminarsFromCourses() {
  try {
    await client.connect();
    
    // 삭제 전 세미나 데이터 확인
    const beforeCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('\n삭제 전 세미나 수:', beforeCount.rows[0].count);
    
    // 마이그레이션 SQL 파일 읽기
    const sql = fs.readFileSync('./migrations/delete_seminars_from_courses.sql', 'utf8');
    
    // 세미나 데이터 삭제 실행
    await client.query(sql);
    console.log('세미나 데이터 삭제 완료');
    
    // 삭제 후 세미나 데이터 확인
    const afterCount = await client.query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('삭제 후 세미나 수:', afterCount.rows[0].count);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

deleteSeminarsFromCourses(); 