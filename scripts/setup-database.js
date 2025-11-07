/**
 * Database Schema Setup Script
 *
 * Executes the multi-tenant schema on the PostgreSQL database
 */

import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Pool } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read database credentials from .env
const envPath = path.join(__dirname, '../.env');
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found');
  process.exit(1);
}

const envFile = fs.readFileSync(envPath, 'utf8');
const getEnvVar = (key) => {
  const match = envFile.match(new RegExp(`${key}=(.+)`));
  return match ? match[1].trim() : null;
};

const DB_HOST = getEnvVar('DB_HOST');
const DB_PORT = getEnvVar('DB_PORT');
const DB_NAME = getEnvVar('DB_NAME');
const DB_USER = getEnvVar('DB_USER');
const DB_PASSWORD = getEnvVar('DB_PASSWORD');

if (!DB_HOST || !DB_PORT || !DB_NAME || !DB_USER || !DB_PASSWORD) {
  console.error('❌ Missing database credentials in .env');
  process.exit(1);
}

// Create connection pool with explicit parameters
const pool = new Pool({
  host: DB_HOST,
  port: parseInt(DB_PORT),
  database: DB_NAME,
  user: DB_USER,
  password: DB_PASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function setupDatabase() {
  const client = await pool.connect();

  try {
    console.log('🔗 Connected to database');
    console.log('📋 Reading schema file...');

    // Read schema SQL file
    const schemaSQL = fs.readFileSync(
      path.join(__dirname, '../db/schema-multi-tenant.sql'),
      'utf8'
    );

    console.log('🚀 Executing schema...\n');

    // Execute schema
    await client.query(schemaSQL);

    console.log('\n✅ Schema executed successfully!');
    console.log('\nCreated:');
    console.log(
      '  - 7 tables (tenants, sessions, ab_tests, ab_assignments, events, bookings, social_media_metrics)'
    );
    console.log(
      '  - 3 views (funnel_metrics_view, conversion_sources_view, tenant_dashboard_view)'
    );
    console.log('  - 4 functions (track_event, assign_ab_test, create_booking, get_ab_assignment)');

    // Verify tables were created
    const tables = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    console.log('\n📊 Verified tables:');
    tables.rows.forEach((row) => {
      console.log(`  ✓ ${row.table_name}`);
    });
  } catch (error) {
    console.error('\n❌ Error executing schema:', error.message);

    if (error.position) {
      console.error('\nError position:', error.position);
    }

    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

setupDatabase();
