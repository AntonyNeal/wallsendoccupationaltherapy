import pg from 'pg';
import fs from 'fs';

const { Client } = pg;

const client = new Client({
  host: 'companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com',
  port: 25060,
  database: 'defaultdb',
  user: 'doadmin',
  password: process.env.DB_PASSWORD || 'your_password_here',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to database\n');

    const sql = fs.readFileSync('db/schema-multi-tenant.sql', 'utf8');
    console.log('📋 Executing schema...\n');

    await client.query(sql);
    console.log('✅ Schema executed successfully!\n');

    const tables = await client.query(
      `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name`
    );

    console.log('📊 Tables created:');
    tables.rows.forEach((r) => console.log('  ✓', r.table_name));

    await client.end();
  } catch (err) {
    console.error('❌ Error:', err.message);
    if (err.position) {
      console.error('Position:', err.position);
      const sql = fs.readFileSync('db/schema-multi-tenant.sql', 'utf8');
      const pos = parseInt(err.position);
      const start = Math.max(0, pos - 100);
      const end = Math.min(sql.length, pos + 100);
      console.error('\nContext around error:');
      console.error(sql.substring(start, end));
      console.error(' '.repeat(pos - start) + '^');
    }
    await client.end();
    process.exit(1);
  }
}

run();
