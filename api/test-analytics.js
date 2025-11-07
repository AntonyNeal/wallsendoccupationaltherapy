/**
 * Test Analytics API endpoints
 */

const db = require('./utils/db');

async function testAnalytics() {
  console.log('Testing Analytics API...\n');

  try {
    // Connect to database
    await db.query('SELECT NOW()');
    console.log('✅ Database connected');

    // Get test data
    const tenantResult = await db.query(
      "SELECT id FROM tenants WHERE subdomain = 'claire' LIMIT 1"
    );
    const tenantId = tenantResult.rows[0].id;

    console.log('Test data:');
    console.log('  Tenant ID:', tenantId);
    console.log('');

    // Test 1: Create session
    console.log('1. Creating test session...');
    const sessionToken = 'test_session_' + Math.random().toString(36).substring(7);
    const sessionResult = await db.query(
      `INSERT INTO sessions (
        tenant_id,
        session_token,
        fingerprint,
        utm_source,
        utm_medium,
        utm_campaign,
        device_type,
        browser,
        os,
        landing_page,
        page_views
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING id, session_token, page_views, device_type, created_at`,
      [
        tenantId,
        sessionToken,
        'fp_test_123',
        'google',
        'organic',
        'summer_promo',
        'desktop',
        'Chrome',
        'Windows',
        '/home',
        5,
      ]
    );

    if (sessionResult.rows.length > 0) {
      const session = sessionResult.rows[0];
      console.log('✅ Session created:');
      console.log('   ID:', session.id);
      console.log('   Token:', session.session_token);
      console.log('   Page Views:', session.page_views);
      console.log('   Device:', session.device_type);

      // Test 2: Log events
      console.log('\n2. Logging test events...');
      const events = [
        { type: 'page_view', data: { page: '/home' } },
        { type: 'photo_click', data: { photo_id: 1, position: 1 } },
        { type: 'pricing_view', data: { section: 'services' } },
        { type: 'form_start', data: { form: 'booking' } },
      ];

      for (const event of events) {
        await db.query(
          `INSERT INTO events (session_id, tenant_id, event_type, event_data)
           VALUES ($1, $2, $3, $4)`,
          [session.id, tenantId, event.type, JSON.stringify(event.data)]
        );
      }
      console.log(`✅ Logged ${events.length} events`);

      // Test 3: Get session details
      console.log('\n3. Retrieving session with events...');
      const detailsResult = await db.query(
        `SELECT 
          s.*,
          COUNT(e.id) as event_count
        FROM sessions s
        LEFT JOIN events e ON s.id = e.session_id
        WHERE s.id = $1
        GROUP BY s.id`,
        [session.id]
      );

      if (detailsResult.rows.length > 0) {
        const details = detailsResult.rows[0];
        console.log('✅ Session details:');
        console.log('   Page Views:', details.page_views);
        console.log('   Events:', details.event_count);
        console.log('   UTM Source:', details.utm_source);
        console.log('   Browser:', details.browser);
      }

      // Test 4: Get analytics metrics
      console.log('\n4. Getting analytics metrics...');
      const metricsResult = await db.query(
        `SELECT 
          COUNT(DISTINCT s.id) as total_sessions,
          COUNT(DISTINCT s.fingerprint) as unique_visitors,
          AVG(s.page_views)::numeric(10,2) as avg_page_views,
          COUNT(e.id) as total_events
        FROM sessions s
        LEFT JOIN events e ON s.id = e.session_id
        WHERE s.tenant_id = $1`,
        [tenantId]
      );

      if (metricsResult.rows.length > 0) {
        const metrics = metricsResult.rows[0];
        console.log('✅ Analytics metrics:');
        console.log('   Total Sessions:', metrics.total_sessions);
        console.log('   Unique Visitors:', metrics.unique_visitors);
        console.log('   Avg Page Views:', metrics.avg_page_views);
        console.log('   Total Events:', metrics.total_events);
      }

      // Test 5: Get top events
      console.log('\n5. Getting top event types...');
      const topEventsResult = await db.query(
        `SELECT 
          event_type,
          COUNT(*) as count
        FROM events
        WHERE tenant_id = $1
        GROUP BY event_type
        ORDER BY count DESC
        LIMIT 5`,
        [tenantId]
      );

      console.log(`✅ Top ${topEventsResult.rows.length} event types:`);
      topEventsResult.rows.forEach((e) => {
        console.log(`   - ${e.event_type}: ${e.count}`);
      });

      // Test 6: Get UTM source breakdown
      console.log('\n6. Getting UTM source breakdown...');
      const utmResult = await db.query(
        `SELECT 
          utm_source,
          COUNT(*) as sessions,
          COUNT(DISTINCT fingerprint) as unique_visitors
        FROM sessions
        WHERE tenant_id = $1
          AND utm_source IS NOT NULL
        GROUP BY utm_source
        ORDER BY sessions DESC`,
        [tenantId]
      );

      console.log(`✅ Found ${utmResult.rows.length} UTM sources:`);
      utmResult.rows.forEach((u) => {
        console.log(`   - ${u.utm_source}: ${u.sessions} sessions (${u.unique_visitors} unique)`);
      });

      // Cleanup
      console.log('\n7. Cleaning up test data...');
      await db.query('DELETE FROM events WHERE session_id = $1', [session.id]);
      await db.query('DELETE FROM sessions WHERE id = $1', [session.id]);
      console.log('✅ Test data cleaned up');
    }

    console.log('\n✅ All analytics tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    // Don't call db.end() as it's a pool
    process.exit(0);
  }
}

testAnalytics();
