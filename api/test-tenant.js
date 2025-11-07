require('dotenv').config();
const db = require('./utils/db');

async function testTenant() {
  try {
    console.log('Testing tenant query...');
    const result = await db.query(
      `SELECT id, subdomain, name, email FROM tenants WHERE subdomain = $1`,
      ['claire']
    );
    console.log('Found:', result.rows);
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

testTenant();
