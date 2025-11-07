# Location & Availability System

## Overview

The schema now includes comprehensive **location tracking** and **availability scheduling** for touring companions. This enables:

- 📍 **Multi-city presence** - Track which cities a companion is in on specific dates
- 📅 **Availability calendar** - Mark available/booked/blocked time slots
- 🗓️ **Touring schedules** - Display "In Sydney Nov 10-15, Melbourne Nov 20-25"
- 🔗 **Location-aware bookings** - Link bookings to specific locations and dates
- 📊 **Location analytics** - See which cities drive the most bookings

---

## Database Tables

### `locations`

Tracks where companions are or will be on specific dates.

**Key Fields:**

- `location_type` - `home` (base location), `touring` (temporary visit), `available` (general)
- `city`, `country` - Geographic location
- `available_from` / `available_until` - Date range
- `is_current` - Currently at this location?
- `is_public` - Show on website?
- `latitude` / `longitude` - For distance calculations

**Example:**

```sql
-- Claire's home base
INSERT INTO locations (tenant_id, location_type, city, country, available_from, is_current, is_public)
VALUES ('claire-id', 'home', 'Canberra', 'AU', '2025-01-01', true, true);

-- Touring in Sydney
INSERT INTO locations (tenant_id, location_type, city, state_province, country, available_from, available_until, is_public)
VALUES ('claire-id', 'touring', 'Sydney', 'NSW', 'AU', '2025-12-10', '2025-12-15', true);
```

### `availability_calendar`

Daily availability tracking with time slot support.

**Key Fields:**

- `date` - Specific date
- `status` - `available`, `booked`, `blocked`, `tentative`
- `is_all_day` - True for full-day availability
- `time_slot_start` / `time_slot_end` - Specific hours (optional)
- `min_duration_hours` - Minimum booking length

**Example:**

```sql
-- Mark Dec 10 as fully available
INSERT INTO availability_calendar (tenant_id, date, status, is_all_day)
VALUES ('claire-id', '2025-12-10', 'available', true);

-- Specific time slots
INSERT INTO availability_calendar (tenant_id, date, status, is_all_day, time_slot_start, time_slot_end, min_duration_hours)
VALUES ('claire-id', '2025-12-11', 'available', false, '14:00', '22:00', 2);
```

### `bookings` (Enhanced)

Now links to location and availability.

**New Fields:**

- `location_id` - Which location/city
- `availability_id` - Which calendar slot
- `booking_city` / `booking_country` - Captured at booking time (snapshot)
- `preferred_date_end` - For multi-day bookings
- `duration_hours` - Numeric for calculations
- `outcall_address` / `incall_location` - Service location details
- `status` - Added `no_show` option

---

## Helper Functions

### `get_current_location(tenant_id)`

Returns companion's current location.

```sql
SELECT * FROM get_current_location('claire-id');
-- Returns: location_id, city, state_province, country, available_from, available_until
```

### `get_touring_schedule(tenant_id, days_ahead)`

Returns upcoming touring schedule.

```sql
SELECT * FROM get_touring_schedule('claire-id', 90);
-- Returns: All locations for next 90 days
```

### `check_availability(tenant_id, date, duration_hours)`

Check if companion is available on specific date.

```sql
SELECT * FROM check_availability('claire-id', '2025-12-10', 3);
-- Returns: is_available, availability_id, status, time_slots, location_city
```

### `get_available_dates(tenant_id, start_date, end_date)`

Get list of available dates in range.

```sql
SELECT * FROM get_available_dates('claire-id', '2025-12-01', '2025-12-31');
-- Returns: date, availability_count, city (for each available day)
```

---

## Analytical Views

### `v_location_bookings`

Booking performance by location.

```sql
SELECT * FROM v_location_bookings WHERE tenant_id = 'claire-id';
```

**Returns:**

- Total/confirmed/completed/cancelled bookings per city
- Average duration per location
- First and last booking dates

**Use cases:**

- "Which cities are most profitable?"
- "Should I tour more in Sydney or Melbourne?"
- "What's my average booking length in Brisbane?"

### `v_availability_utilization`

Calendar utilization rates.

```sql
SELECT * FROM v_availability_utilization
WHERE tenant_id = 'claire-id'
  AND date >= CURRENT_DATE
ORDER BY date;
```

**Returns:**

- Total slots vs booked slots per day
- Utilization rate (% of time booked)
- By location/city

**Use cases:**

- "Am I pricing too low if I'm 90% booked?"
- "Which cities have low utilization?"
- "Should I add more availability in peak cities?"

---

## Automatic Triggers

### Auto-update availability on booking

When a booking is **confirmed**, the linked availability slot automatically changes to `booked`.
When a booking is **cancelled**, the availability slot returns to `available`.

```sql
-- This happens automatically via trigger
UPDATE bookings SET status = 'confirmed' WHERE id = 'booking-id';
-- → availability_calendar.status automatically set to 'booked'
```

---

## Frontend Integration

### Display Current Location

```typescript
// API endpoint: GET /api/tenants/:subdomain/location/current
const response = await fetch('/api/tenants/claire/location/current');
const location = await response.json();

// Show: "Currently in: Canberra, ACT"
```

### Display Touring Schedule

```typescript
// API endpoint: GET /api/tenants/:subdomain/locations/touring
const response = await fetch('/api/tenants/claire/locations/touring');
const schedule = await response.json();

// Show calendar:
// Dec 10-15: Sydney, NSW
// Dec 20-25: Melbourne, VIC
// Jan 5-10: Brisbane, QLD
```

### Availability Calendar Widget

```typescript
// API endpoint: GET /api/tenants/:subdomain/availability?start=2025-12-01&end=2025-12-31
const response = await fetch('/api/tenants/claire/availability?start=2025-12-01&end=2025-12-31');
const dates = await response.json();

// Render calendar with available dates highlighted
// Show city for each date (touring context)
```

### Booking Form Integration

```typescript
// When user selects a date:
const checkAvail = await fetch('/api/tenants/claire/availability/check?date=2025-12-10&duration=3');
const { is_available, location_city } = await checkAvail.json();

if (is_available) {
  // Show: "Available in Sydney on Dec 10"
  // Submit booking with location_id and availability_id
}
```

---

## Use Cases

### 1. Home-Based Companion (Claire in Canberra)

```sql
-- Insert home location (permanent)
INSERT INTO locations (tenant_id, location_type, city, country, available_from, is_current)
VALUES ('claire-id', 'home', 'Canberra', 'AU', '2025-01-01', true);

-- Mark availability for next 30 days
INSERT INTO availability_calendar (tenant_id, date, status, is_all_day)
SELECT 'claire-id', generate_series(CURRENT_DATE, CURRENT_DATE + 30, '1 day')::date, 'available', true;
```

**Website shows:**

- "Based in Canberra, ACT"
- Availability calendar for next 30 days

### 2. Touring Companion (Multi-City)

```sql
-- Sydney Dec 10-15
INSERT INTO locations (tenant_id, location_type, city, state_province, country, available_from, available_until)
VALUES ('sophie-id', 'touring', 'Sydney', 'NSW', 'AU', '2025-12-10', '2025-12-15');

-- Melbourne Dec 20-25
INSERT INTO locations (tenant_id, location_type, city, state_province, country, available_from, available_until)
VALUES ('sophie-id', 'touring', 'Melbourne', 'VIC', 'AU', '2025-12-20', '2025-12-25');

-- Mark availability for Sydney dates
INSERT INTO availability_calendar (tenant_id, date, status)
SELECT 'sophie-id', generate_series('2025-12-10'::date, '2025-12-15'::date, '1 day')::date, 'available';

-- Mark availability for Melbourne dates
INSERT INTO availability_calendar (tenant_id, date, status)
SELECT 'sophie-id', generate_series('2025-12-20'::date, '2025-12-25'::date, '1 day')::date, 'available';
```

**Website shows:**

- "Touring Schedule:"
  - Dec 10-15: Sydney, NSW
  - Dec 20-25: Melbourne, VIC
- Calendar with city labels per date
- Booking form auto-fills city based on selected date

### 3. Fly-Me-To-You Service

```sql
-- Mark as available worldwide (no specific location)
INSERT INTO locations (tenant_id, location_type, city, country, available_from)
VALUES ('emma-id', 'available', 'International', 'XX', '2025-01-01');

-- Client books for specific city
-- Booking captures their requested location
INSERT INTO bookings (tenant_id, client_name, booking_city, booking_country, outcall_address)
VALUES ('emma-id', 'Client Name', 'Tokyo', 'JP', 'Hotel details...');
```

**Website shows:**

- "Available for international travel"
- Booking form has city selector
- Booking stored with client's location

---

## Analytics Examples

### Bookings by City

```sql
SELECT
  city,
  COUNT(*) AS total_bookings,
  COUNT(*) FILTER (WHERE status = 'completed') AS completed,
  AVG(duration_hours) AS avg_duration
FROM bookings
WHERE tenant_id = 'claire-id'
  AND booking_city IS NOT NULL
GROUP BY city
ORDER BY total_bookings DESC;
```

### Touring ROI Analysis

```sql
SELECT
  l.city,
  l.available_from,
  l.available_until,
  (l.available_until - l.available_from) AS days_touring,
  COUNT(b.id) AS bookings_received,
  SUM(b.duration_hours) AS total_hours_booked
FROM locations l
LEFT JOIN bookings b ON l.id = b.location_id
WHERE l.tenant_id = 'claire-id'
  AND l.location_type = 'touring'
GROUP BY l.id, l.city, l.available_from, l.available_until
ORDER BY l.available_from DESC;
```

### Utilization by Day of Week

```sql
SELECT
  EXTRACT(DOW FROM ac.date) AS day_of_week,
  TO_CHAR(ac.date, 'Day') AS day_name,
  COUNT(*) AS total_days,
  COUNT(*) FILTER (WHERE ac.status = 'booked') AS booked_days,
  ROUND(COUNT(*) FILTER (WHERE ac.status = 'booked')::DECIMAL / COUNT(*) * 100, 2) AS utilization_pct
FROM availability_calendar ac
WHERE tenant_id = 'claire-id'
  AND date >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY EXTRACT(DOW FROM ac.date), TO_CHAR(ac.date, 'Day')
ORDER BY day_of_week;
```

---

## Summary

**What's New:**

- ✅ Track locations by date (home base + touring)
- ✅ Availability calendar with time slots
- ✅ Link bookings to specific locations
- ✅ Auto-update availability on booking confirmation
- ✅ Location-based analytics
- ✅ Geographic queries (current location, touring schedule)
- ✅ Utilization tracking per city

**Benefits:**

- Clear touring schedules for clients
- Location-aware booking flow
- Data-driven touring decisions (which cities are profitable?)
- Prevent double-bookings via availability tracking
- Analytics on location performance
- Support for home-based, touring, and FMTY models

Ready to implement in the frontend! 🚀
