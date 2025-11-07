require('dotenv').config();
const db = require('./utils/db');

async function testBookings() {
  try {
    console.log('Testing Booking API...\n');

    const claireTenantId = '9daa3c12-bdec-4dc0-993d-7f9f8f391557';

    // Get Sydney location
    const locationResult = await db.query(`SELECT id FROM locations WHERE tenant_id = $1 LIMIT 1`, [
      claireTenantId,
    ]);
    const locationId = locationResult.rows[0]?.id;

    // Get an available date
    const availResult = await db.query(
      `SELECT id, date FROM availability_calendar 
       WHERE tenant_id = $1 AND status = 'available' AND date >= CURRENT_DATE
       LIMIT 1`,
      [claireTenantId]
    );
    const availabilityId = availResult.rows[0]?.id;
    const preferredDate = availResult.rows[0]?.date;

    console.log('Test data:');
    console.log('  Tenant ID:', claireTenantId);
    console.log('  Location ID:', locationId);
    console.log('  Availability ID:', availabilityId);
    console.log('  Preferred Date:', preferredDate);
    console.log('');

    // Test 1: Create booking
    console.log('1. Creating test booking...');
    const createResult = await db.query(
      `INSERT INTO bookings (
        tenant_id,
        location_id,
        availability_id,
        client_name,
        client_email,
        client_phone,
        service_type,
        preferred_date,
        duration,
        duration_hours,
        message,
        status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING id, client_name, status, created_at`,
      [
        claireTenantId,
        locationId,
        availabilityId,
        'John Doe',
        'john.doe@example.com',
        '+61 400 123 456',
        'Dinner Date',
        preferredDate,
        '2 hours',
        2.0,
        'Looking forward to meeting you!',
        'pending',
      ]
    );

    const booking = createResult.rows[0];
    console.log('✅ Booking created:');
    console.log('   ID:', booking.id);
    console.log('   Client:', booking.client_name);
    console.log('   Status:', booking.status);
    console.log('');

    // Test 2: Get booking
    console.log('2. Retrieving booking...');
    const getResult = await db.query(
      `SELECT 
        b.id,
        b.client_name,
        b.client_email,
        b.status,
        b.preferred_date,
        t.name as tenant_name
       FROM bookings b
       LEFT JOIN tenants t ON b.tenant_id = t.id
       WHERE b.id = $1`,
      [booking.id]
    );

    if (getResult.rows.length > 0) {
      console.log('✅ Booking retrieved:');
      console.log('   Client:', getResult.rows[0].client_name);
      console.log('   Email:', getResult.rows[0].client_email);
      console.log('   Tenant:', getResult.rows[0].tenant_name);
      console.log('   Status:', getResult.rows[0].status);
    }
    console.log('');

    // Test 3: Update status to confirmed
    console.log('3. Updating booking status to confirmed...');
    const updateResult = await db.query(
      `UPDATE bookings
       SET status = $1, confirmed_at = NOW()
       WHERE id = $2
       RETURNING id, status, confirmed_at`,
      ['confirmed', booking.id]
    );

    if (updateResult.rows.length > 0) {
      console.log('✅ Status updated:');
      console.log('   New Status:', updateResult.rows[0].status);
      console.log('   Confirmed At:', updateResult.rows[0].confirmed_at);
    }
    console.log('');

    // Test 4: Get tenant bookings
    console.log('4. Getting all bookings for tenant...');
    const listResult = await db.query(
      `SELECT id, client_name, status, preferred_date
       FROM bookings
       WHERE tenant_id = $1
       ORDER BY created_at DESC
       LIMIT 5`,
      [claireTenantId]
    );

    console.log(`✅ Found ${listResult.rows.length} booking(s):`);
    listResult.rows.forEach((b) => {
      console.log(`   - ${b.client_name} (${b.status}) on ${b.preferred_date}`);
    });
    console.log('');

    // Clean up test booking
    console.log('5. Cleaning up test booking...');
    await db.query('DELETE FROM bookings WHERE id = $1', [booking.id]);
    console.log('✅ Test booking deleted');
    console.log('');

    console.log('✅ All booking tests passed!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testBookings();
