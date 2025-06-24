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

async function updateDates() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const updates = [
      {
        oldStart: '2024-03-15 00:00:00',
        newStart: '2025-03-15 00:00:00',
        oldEnd: '2024-03-22 00:00:00',
        newEnd: '2025-03-22 00:00:00'
      },
      {
        oldStart: '2024-04-10 00:00:00',
        newStart: '2025-04-10 00:00:00',
        oldEnd: '2024-04-17 00:00:00',
        newEnd: '2025-04-17 00:00:00'
      },
      {
        oldStart: '2024-05-20 00:00:00',
        newStart: '2025-05-20 00:00:00',
        oldEnd: '2024-05-24 00:00:00',
        newEnd: '2025-05-24 00:00:00'
      },
      {
        oldStart: '2024-06-15 00:00:00',
        newStart: '2025-06-15 00:00:00',
        oldEnd: '2024-06-19 00:00:00',
        newEnd: '2025-06-19 00:00:00'
      },
      {
        oldStart: '2024-07-08 00:00:00',
        newStart: '2025-07-08 00:00:00',
        oldEnd: '2024-07-15 00:00:00',
        newEnd: '2025-07-15 00:00:00'
      }
    ];

    for (const update of updates) {
      await client.query(
        `UPDATE overseas_programs 
         SET start_date = $1, end_date = $2 
         WHERE start_date = $3 AND end_date = $4`,
        [update.newStart, update.newEnd, update.oldStart, update.oldEnd]
      );
    }

    await client.query('COMMIT');
    console.log('해외연수 프로그램 날짜가 성공적으로 수정되었습니다.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('오류 발생:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

updateDates(); 