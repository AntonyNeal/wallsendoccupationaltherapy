# SDK Usage Guide - Complete Frontend Integration

## 📦 Installation

### Option 1: NPM Package (Recommended)

```bash
npm install @clairehamilton/companion-sdk
```

### Option 2: Direct Import (ES Modules)

```html
<script type="module">
  import {
    TenantDataSource,
    BookingDataSource,
    PaymentDataSource,
  } from 'https://cdn.clairehamilton.vip/companion-sdk@1.0.0.js';
</script>
```

### Option 3: CDN Script Tag (Browser)

```html
<script src="https://cdn.clairehamilton.vip/companion-sdk@1.0.0.js"></script>
<script>
  const { TenantDataSource, BookingDataSource } = window.CompanionSDK;
</script>
```

---

## 🎯 Quick Start Examples

### 1. Basic Tenant Detection

```typescript
import { TenantDataSource } from '@clairehamilton/companion-sdk';

// Auto-detect from current domain
const tenant = await TenantDataSource.getCurrent();
console.log(`Welcome to ${tenant.businessName}`);
```

### 2. Check Availability

```typescript
import { AvailabilityDataSource } from '@clairehamilton/companion-sdk';

// Check if a specific date is available
const { available, slot } = await AvailabilityDataSource.checkDate(
  tenant.id,
  '2025-12-25'
);

if (available) {
  console.log(`Available: ${slot.availableSlots} slots remaining`);
}

// Get all available dates in a range
const dates = await AvailabilityDataSource.getAvailableDates(
  tenant.id,
  '2025-01-01',
  '2025-12-31'
);
```

### 3. Create a Booking

```typescript
import { BookingDataSource } from '@clairehamilton/companion-sdk';

const booking = await BookingDataSource.create({
  tenantId: tenant.id,
  locationId: 1,
  clientName: 'Sarah Smith',
  clientEmail: 'sarah@example.com',
  clientPhone: '+61412345678',
  serviceType: 'bridal_makeup',
  startDate: '2025-06-15',
  endDate: '2025-06-15',
  durationHours: 4,
  specialRequests: 'Outdoor wedding, natural look',
  utmSource: 'instagram',
  utmCampaign: 'summer_weddings',
});

console.log(`Booking created: ${booking.id}`);
```

### 4. Process Payment

```typescript
import { PaymentDataSource } from '@clairehamilton/companion-sdk';

const payment = await PaymentDataSource.create({
  bookingId: booking.id,
  amount: 450.00,
  currency: 'AUD',
  paymentMethod: 'card',
  processor: 'stripe',
  processorPaymentId: 'pi_xyz123',
});

// Check payment status
const isCompleted = await PaymentDataSource.isCompleted(payment.id);
```

### 5. Track Analytics

```typescript
import { AnalyticsDataSource } from '@clairehamilton/companion-sdk';

// Initialize session (automatic tracking)
const sessionId = await AnalyticsDataSource.initialize(tenant.id, {
  utmSource: 'google',
  utmMedium: 'cpc',
  utmCampaign: 'summer_2025',
});

// Track custom events
await AnalyticsDataSource.track('button_click', {
  button: 'book_now',
  location: 'hero_section',
});

await AnalyticsDataSource.track('form_started', {
  form: 'booking_form',
});
```

---

## 📊 Business Analytics Examples

### Get Performance Overview

```typescript
import { TenantAnalyticsDataSource } from '@clairehamilton/companion-sdk';

const performance = await TenantAnalyticsDataSource.getPerformance(
  tenant.id,
  '2025-01-01',
  '2025-12-31'
);

console.log(`Total Bookings: ${performance.totalBookings}`);
console.log(`Revenue: $${performance.totalRevenue}`);
console.log(`Conversion Rate: ${performance.conversionRate}%`);
```

### Analyze Traffic Sources

```typescript
const sources = await TenantAnalyticsDataSource.getTrafficSources(tenant.id, 30);

sources.forEach(source => {
  console.log(`${source.source}: ${source.bookings} bookings, ${source.conversionRate}% conversion`);
});
```

### A/B Test Results

```typescript
const tests = await TenantAnalyticsDataSource.getABTestResults(tenant.id);

tests.forEach(test => {
  console.log(`Test: ${test.testName}`);
  test.variants.forEach(variant => {
    console.log(`  ${variant.variantName}: ${(variant.conversionRate * 100).toFixed(2)}%`);
  });
});
```

---

## 📱 Social Media Analytics

### Track Post Performance

```typescript
import { SocialAnalyticsDataSource } from '@clairehamilton/companion-sdk';

const posts = await SocialAnalyticsDataSource.getPostPerformance(tenant.id, 10);

posts.forEach(post => {
  console.log(`${post.platform} - ${post.engagement.likes} likes, ${post.conversions.bookings} bookings`);
});
```

### Compare Platforms

```typescript
const platforms = await SocialAnalyticsDataSource.getPlatformPerformance(tenant.id, 90);

platforms.forEach(platform => {
  console.log(`${platform.platform}: ${platform.totalBookings} bookings, ROI: ${platform.roi}`);
});
```

### Analyze Follower Growth

```typescript
const growth = await SocialAnalyticsDataSource.getFollowerGrowth(
  tenant.id,
  'Instagram',
  90
);

console.log(`Total Growth: ${growth.summary.totalGrowth} followers`);
console.log(`Avg Daily Growth: ${growth.summary.avgGrowthRate}%`);
console.log(`Peak Day: ${growth.summary.peakGrowthDate} (+${growth.summary.peakGrowth})`);
```

---

## 🔧 Complete Integration Example

### React Component

```tsx
import React, { useState, useEffect } from 'react';
import {
  TenantDataSource,
  AvailabilityDataSource,
  BookingDataSource,
  AnalyticsDataSource,
} from '@clairehamilton/companion-sdk';

function BookingWidget() {
  const [tenant, setTenant] = useState(null);
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function init() {
      // Detect tenant and initialize analytics
      const t = await TenantDataSource.getCurrent();
      setTenant(t);
      await AnalyticsDataSource.initialize(t.id);

      // Load available dates
      const availableDates = await AvailabilityDataSource.getAvailableDates(
        t.id,
        '2025-01-01',
        '2025-12-31'
      );
      setDates(availableDates);
    }
    init();
  }, []);

  const handleBooking = async (formData) => {
    setLoading(true);
    try {
      const booking = await BookingDataSource.create({
        tenantId: tenant.id,
        ...formData,
      });

      await AnalyticsDataSource.track('booking_completed', {
        bookingId: booking.id,
        amount: formData.amount,
      });

      alert('Booking created successfully!');
    } catch (error) {
      console.error('Booking failed:', error);
      await AnalyticsDataSource.track('booking_failed', {
        error: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2>{tenant?.businessName}</h2>
      <select onChange={(e) => setSelectedDate(e.target.value)}>
        {dates.map((date) => (
          <option key={date.date} value={date.date}>
            {date.date} ({date.slotsRemaining} slots)
          </option>
        ))}
      </select>
      <button onClick={handleBooking} disabled={loading}>
        {loading ? 'Processing...' : 'Book Now'}
      </button>
    </div>
  );
}
```

### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
<head>
  <title>Booking System</title>
</head>
<body>
  <div id="app"></div>

  <script type="module">
    import {
      TenantDataSource,
      AvailabilityDataSource,
      BookingDataSource,
      AnalyticsDataSource,
    } from 'https://cdn.clairehamilton.vip/companion-sdk@1.0.0.js';

    async function init() {
      // Initialize
      const tenant = await TenantDataSource.getCurrent();
      await AnalyticsDataSource.initialize(tenant.id);

      // Render UI
      document.getElementById('app').innerHTML = `
        <h1>${tenant.businessName}</h1>
        <button id="bookBtn">Check Availability</button>
      `;

      // Event handler
      document.getElementById('bookBtn').addEventListener('click', async () => {
        const dates = await AvailabilityDataSource.getAvailableDates(
          tenant.id,
          '2025-01-01',
          '2025-12-31'
        );
        console.log('Available dates:', dates);
      });
    }

    init();
  </script>
</body>
</html>
```

---

## 🎨 All Available Datasources

| Datasource | Purpose | Key Methods |
|------------|---------|-------------|
| **TenantDataSource** | Tenant discovery | `getCurrent()`, `getBySubdomain()`, `getByDomain()` |
| **AvailabilityDataSource** | Calendar & scheduling | `checkDate()`, `getAvailableDates()`, `getTouringSchedule()` |
| **LocationDataSource** | Location management | `getByTenant()`, `getGroupedByCountry()`, `getAvailable()` |
| **BookingDataSource** | Booking operations | `create()`, `getById()`, `confirm()`, `cancel()` |
| **PaymentDataSource** | Payment processing | `create()`, `refund()`, `getByBooking()`, `getTotalRevenue()` |
| **AnalyticsDataSource** | Session tracking | `initialize()`, `track()`, `getSummary()` |
| **TenantAnalyticsDataSource** | Business metrics | `getPerformance()`, `getTrafficSources()`, `getConversionFunnel()` |
| **SocialAnalyticsDataSource** | Social media insights | `getPostPerformance()`, `getPlatformPerformance()`, `getFollowerGrowth()` |

---

## 🚀 Publishing Your Own SDK Instance

If you want to host your own version:

```bash
cd sdk
npm run build
npm publish --access public
```

Or deploy to your own CDN:

```bash
npm run build
cp dist/* /path/to/cdn/companion-sdk/
```

---

## 📚 TypeScript Type Definitions

All datasources are fully typed. Import types for better IDE support:

```typescript
import type {
  Tenant,
  Booking,
  Payment,
  Location,
  AvailabilitySlot,
  AnalyticsSummary,
  TenantPerformance,
  PostPerformance,
  ABTestResult,
  FollowerGrowthSummary,
} from '@clairehamilton/companion-sdk';
```

---

## ⚡ Performance Tips

1. **Cache tenant data**: Call `TenantDataSource.getCurrent()` once per session
2. **Batch analytics**: Use `track()` for multiple events instead of individual calls
3. **Lazy load analytics**: Initialize analytics after main content loads
4. **Use date ranges wisely**: Limit analytics queries to necessary date ranges

---

## 🔒 Security Notes

- Never expose API keys in client-side code
- Use HTTPS for all API calls (enforced by default)
- Payment processing should always be server-side verified
- Rate limiting is applied per IP address

---

## 📞 Support

- **Documentation**: https://github.com/AntonyNeal/sw_website/tree/main/sdk
- **Issues**: https://github.com/AntonyNeal/sw_website/issues
- **API Base**: https://avaliable.pro/api
