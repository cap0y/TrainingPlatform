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

async function recreateTable() {
  try {
    await client.connect();
    
    // Drop existing table
    await client.query('DROP TABLE IF EXISTS enrollment_progress CASCADE');
    
    // Create new table
    await client.query(`
      CREATE TABLE enrollment_progress (
        id SERIAL PRIMARY KEY,
        enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        item_id VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        progress INTEGER NOT NULL DEFAULT 0,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(enrollment_id, user_id, item_id)
      );
    `);

    // Create indexes
    await client.query(`
      CREATE INDEX idx_enrollment_progress_enrollment_id ON enrollment_progress(enrollment_id);
      CREATE INDEX idx_enrollment_progress_user_id ON enrollment_progress(user_id);
      CREATE INDEX idx_enrollment_progress_type ON enrollment_progress(type);
    `);

    console.log('Table recreated successfully!');
  } catch (err) {
    console.error('Error recreating table:', err);
  } finally {
    await client.end();
  }
}

recreateTable(); 