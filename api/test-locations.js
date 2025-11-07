require('dotenv').config();
const db = require('./utils/db');

async function testLocations() {
  try {
    console.log('Testing locations query...');

    // Check schema
    const schema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'locations' 
      ORDER BY ordinal_position
    `);
    console.log('\nlocations columns:');
    schema.rows.forEach((c) => console.log('  ', c.column_name, '-', c.data_type));

    // Test query
    const result = await db.query(`SELECT * FROM locations WHERE tenant_id = $1`, [
      '9daa3c12-bdec-4dc0-993d-7f9f8f391557',
    ]);
    console.log('\nFound locations:', result.rows);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testLocations();
