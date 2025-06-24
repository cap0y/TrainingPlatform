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

async function checkData() {
  try {
    await client.connect();
    
    // 수강 정보 조회
    console.log('=== 수강 정보 ===');
    const enrollment = await client.query('SELECT * FROM enrollments WHERE id = 5');
    console.log(enrollment.rows[0]);

    if (enrollment.rows[0]) {
      // 과정 정보 조회
      console.log('\n=== 과정 정보 ===');
      const course = await client.query('SELECT * FROM courses WHERE id = $1', [enrollment.rows[0].course_id]);
      console.log(course.rows[0]);
    }

  } catch (err) {
    console.error('Error checking data:', err);
  } finally {
    await client.end();
  }
}

checkData(); 