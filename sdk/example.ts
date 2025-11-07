/**
 * SDK Usage Example
 * Demonstrates how to use the Companion SDK in a real application
 */

import {
  TenantDataSource,
  AvailabilityDataSource,
  LocationDataSource,
  BookingDataSource,
  AnalyticsDataSource,
  type Tenant,
} from './src/index';

async function exampleUsage() {
  try {
    console.log('🚀 Companion SDK Example\n');

    // 1. Get current tenant
    console.log('1️⃣ Fetching tenant...');
    const tenant: Tenant = await TenantDataSource.getBySubdomain('claire');
    console.log(`   ✅ Tenant: ${tenant.name} (${tenant.subdomain})`);
    console.log(`   📧 Email: ${tenant.email}`);
    console.log(`   🌐 Domain: ${tenant.customDomain || 'N/A'}\n`);

    // 2. Initialize analytics
    console.log('2️⃣ Initializing analytics...');
    try {
      const sessionId = await AnalyticsDataSource.initialize(tenant.id, {
        utmSource: 'example',
        utmMedium: 'sdk_test',
        utmCampaign: 'demo',
      });
      console.log(`   ✅ Session: ${sessionId}\n`);
    } catch {
      console.log(`   ⚠️  Analytics initialization skipped (browser-only)\n`);
    }

    // 3. Get locations
    console.log('3️⃣ Fetching locations...');
    const locations = await LocationDataSource.getByTenant(tenant.id);
    console.log(`   ✅ Found ${locations.length} locations:`);
    locations.forEach((loc) => {
      console.log(`      - ${loc.city}, ${loc.country} (${loc.locationType})`);
      if (loc.availableDatesCount) {
        console.log(`        Available dates: ${loc.availableDatesCount}`);
      }
    });
    console.log('');

    // 4. Check availability
    console.log('4️⃣ Checking availability...');
    const testDate = '2025-12-02';
    const checkResult = await AvailabilityDataSource.checkDate(tenant.id, testDate);
    console.log(`   📅 Date: ${testDate}`);
    console.log(
      `   ${checkResult.available ? '✅' : '❌'} Status: ${checkResult.available ? 'Available' : 'Not Available'}`
    );
    if (checkResult.slot) {
      console.log(`   ⏰ Time: ${checkResult.slot.timeSlotStart || 'All Day'}`);
    }
    console.log('');

    // 5. Get availability calendar
    console.log('5️⃣ Fetching availability calendar...');
    const calendar = await AvailabilityDataSource.getCalendar(
      tenant.id,
      '2025-12-01',
      '2025-12-31'
    );
    const availableSlots = calendar.filter((s) => s.status === 'available');
    console.log(`   ✅ Total slots: ${calendar.length}`);
    console.log(`   📅 Available: ${availableSlots.length}`);
    console.log(`   🚫 Booked: ${calendar.filter((s) => s.status === 'booked').length}\n`);

    // 6. Get tenant bookings
    console.log('6️⃣ Fetching bookings...');
    const bookingsResult = await BookingDataSource.getByTenant(tenant.id);
    console.log(`   ✅ Total bookings: ${bookingsResult.count}`);
    if (bookingsResult.data.length > 0) {
      console.log(`   Latest booking:`);
      const latest = bookingsResult.data[0];
      console.log(`      - Client: ${latest.clientName}`);
      console.log(`      - Date: ${latest.preferredDate}`);
      console.log(`      - Status: ${latest.status}`);
    }
    console.log('');

    // 7. Get analytics summary
    console.log('7️⃣ Fetching analytics...');
    try {
      const summary = await AnalyticsDataSource.getSummary(tenant.id, '2025-01-01', '2025-12-31');
      console.log(`   📊 Analytics Summary:`);
      console.log(`      - Total Bookings: ${summary.totalBookings}`);
      console.log(`      - Confirmed: ${summary.confirmedBookings}`);
      console.log(`      - Conversion Rate: ${summary.conversionRate}%`);
    } catch {
      console.log(`   ⚠️  Analytics summary unavailable (backend issue)`);
    }
    console.log('');

    console.log('✨ All operations completed successfully!');
  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : error);
  }
}

// Run example
exampleUsage();
