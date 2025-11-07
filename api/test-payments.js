/**
 * Test Payment API endpoints
 */

const db = require('./utils/db');

async function testPayments() {
  console.log('Testing Payment API...\n');

  try {
    // Connect to database
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Get test data
    const tenantResult = await db.query(
      "SELECT id FROM tenants WHERE subdomain = 'claire' LIMIT 1"
    );
    const tenantId = tenantResult.rows[0].id;

    const bookingResult = await db.query(
      'SELECT id FROM bookings WHERE tenant_id = $1 AND status = $2 LIMIT 1',
      [tenantId, 'confirmed']
    );
    const bookingId = bookingResult.rows[0]?.id;

    console.log('Test data:');
    console.log('  Tenant ID:', tenantId);
    console.log('  Booking ID:', bookingId || 'None (will test without booking)');
    console.log('');

    // Test 1: Create payment
    console.log('1. Creating test payment...');
    const createResult = await db.query(
      `INSERT INTO payments (
        tenant_id,
        booking_id,
        processor,
        processor_transaction_id,
        amount,
        currency,
        status,
        payment_type,
        processor_fee,
        net_amount,
        description,
        completed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
      RETURNING id, amount, status, payment_type, processor`,
      [
        tenantId,
        bookingId || null,
        'stripe',
        'ch_test_' + Math.random().toString(36).substring(7),
        500.0,
        'USD',
        'completed',
        'deposit',
        15.5,
        484.5,
        'Test deposit payment',
      ]
    );

    if (createResult.rows.length > 0) {
      const payment = createResult.rows[0];
      console.log('✅ Payment created:');
      console.log('   ID:', payment.id);
      console.log('   Amount: $' + payment.amount);
      console.log('   Status:', payment.status);
      console.log('   Type:', payment.payment_type);
      console.log('   Processor:', payment.processor);

      // Test 2: Retrieve payment
      console.log('\n2. Retrieving payment...');
      const getResult = await db.query(
        `SELECT 
          p.*,
          t.name as tenant_name,
          b.client_name
        FROM payments p
        LEFT JOIN tenants t ON p.tenant_id = t.id
        LEFT JOIN bookings b ON p.booking_id = b.id
        WHERE p.id = $1`,
        [payment.id]
      );

      if (getResult.rows.length > 0) {
        const retrieved = getResult.rows[0];
        console.log('✅ Payment retrieved:');
        console.log('   Amount: $' + retrieved.amount);
        console.log('   Tenant:', retrieved.tenant_name);
        console.log('   Client:', retrieved.client_name || 'N/A');
        console.log('   Status:', retrieved.status);
      }

      // Test 3: Get booking payments
      if (bookingId) {
        console.log('\n3. Getting all payments for booking...');
        const bookingPayments = await db.query(
          `SELECT id, amount, status, payment_type, created_at
           FROM payments
           WHERE booking_id = $1
           ORDER BY created_at DESC`,
          [bookingId]
        );

        console.log(`✅ Found ${bookingPayments.rows.length} payment(s) for booking:`);
        bookingPayments.rows.forEach((p) => {
          console.log(`   - $${p.amount} (${p.payment_type}, ${p.status})`);
        });
      }

      // Test 4: Process refund
      console.log('\n4. Processing refund...');
      const refundResult = await db.query(
        `UPDATE payments
         SET refund_amount = $1,
             refund_reason = $2,
             refunded_at = NOW(),
             status = $3
         WHERE id = $4
         RETURNING id, amount, refund_amount, status`,
        [100.0, 'Test refund - partial', 'partially_refunded', payment.id]
      );

      if (refundResult.rows.length > 0) {
        const refunded = refundResult.rows[0];
        console.log('✅ Refund processed:');
        console.log('   Original Amount: $' + refunded.amount);
        console.log('   Refund Amount: $' + refunded.refund_amount);
        console.log('   New Status:', refunded.status);
      }

      // Test 5: Get tenant payments
      console.log('\n5. Getting all payments for tenant...');
      const tenantPayments = await db.query(
        `SELECT id, amount, status, payment_type, processor, created_at
         FROM payments
         WHERE tenant_id = $1
         ORDER BY created_at DESC
         LIMIT 5`,
        [tenantId]
      );

      console.log(`✅ Found ${tenantPayments.rows.length} payment(s) for tenant:`);
      tenantPayments.rows.forEach((p) => {
        console.log(`   - $${p.amount} via ${p.processor} (${p.status})`);
      });

      // Cleanup
      console.log('\n6. Cleaning up test payment...');
      await db.query('DELETE FROM payments WHERE id = $1', [payment.id]);
      console.log('✅ Test payment deleted');
    }

    console.log('\n✅ All payment tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await db.end();
  }
}

testPayments();
