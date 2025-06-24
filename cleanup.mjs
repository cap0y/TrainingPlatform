import pg from 'pg';

const { Pool } = pg;

const pool = new Pool({
  user: 'neondb_owner',
  host: 'ep-small-hill-a6ng8akv.us-west-2.aws.neon.tech',
  database: 'neondb',
  password: 'npg_7nwBviZQqC0p',
  port: 5432,
  ssl: {
    rejectUnauthorized: false
  }
});

async function cleanup() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 생성한 테이블 삭제
    await client.query('DROP TABLE IF EXISTS overseas_trainings');

    // 기존 테이블 데이터 확인
    const result = await client.query('SELECT * FROM overseas_registrations');
    console.log('기존 overseas_registrations 테이블 데이터:', result.rows);

    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

cleanup(); 