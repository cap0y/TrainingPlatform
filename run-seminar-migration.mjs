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
    const sql = fs.readFileSync('./migrations/migrate_seminars_to_courses.sql', 'utf8');
    
    // 마이그레이션 실행
    await client.query(sql);
    console.log('Migration completed successfully');
    
    // 결과 확인
    const coursesResult = await client.query(`
      SELECT id, title, type, category 
      FROM courses 
      WHERE type = 'seminar'
    `);
    console.log('\nMigrated seminars in courses table:', coursesResult.rows);
    
    // 세미나 2번에 대한 course_id 찾기
    const seminar2Result = await client.query(`
      SELECT c.id as course_id, c.title, c.type
      FROM courses c
      JOIN seminars s ON c.title = s.title
      WHERE s.id = 2
    `);
    console.log('\nSeminar 2 course mapping:', seminar2Result.rows);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

runMigration(); 