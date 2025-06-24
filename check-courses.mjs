import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: "postgresql://neondb_owner:npg_7nwBviZQqC0p@ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech/neondb?sslmode=require"
});

async function checkCourses() {
  try {
    await client.connect();
    
    // courses 테이블의 세미나 데이터 확인
    const result = await client.query(`
      SELECT id, title, type, category
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    
    console.log('\n현재 courses 테이블의 세미나 데이터:');
    console.log(result.rows);
    
    // 실제 삭제 실행
    await client.query(`
      DELETE FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('\n세미나 데이터 삭제 완료');
    
    // 삭제 후 재확인
    const afterResult = await client.query(`
      SELECT COUNT(*) as count 
      FROM courses 
      WHERE type = 'seminar' OR category = '세미나'
    `);
    console.log('\n삭제 후 세미나 수:', afterResult.rows[0].count);
    
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
}

checkCourses(); 