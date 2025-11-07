require('dotenv').config();
const db = require('./utils/db');

async function testAvailability() {
  try {
    console.log('Testing availability...');

    // Check availability_calendar schema
    const schema = await db.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'availability_calendar' 
      ORDER BY ordinal_position
    `);
    console.log('\navailability_calendar columns:');
    schema.rows.forEach((c) => console.log('  ', c.column_name, '-', c.data_type));

    // Test simple query
    const result = await db.query(
      `SELECT * FROM availability_calendar WHERE tenant_id = $1 LIMIT 5`,
      ['9daa3c12-bdec-4dc0-993d-7f9f8f391557']
    );
    console.log('\nFound availability records:', result.rows.length);
    if (result.rows.length > 0) {
      console.log('Sample:', result.rows[0]);
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testAvailability();
