-- Multi-Tenant Companion Platform - Database Schema
-- PostgreSQL 15+
-- Created: November 7, 2025

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================================
-- TENANTS (Companions)
-- ============================================================================
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subdomain VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  custom_domain VARCHAR(100),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'preview')),
  
  -- Configuration stored as JSONB for flexibility
  theme_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  content_config JSONB NOT NULL DEFAULT '{}'::jsonb,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_subdomain CHECK (subdomain ~ '^[a-z0-9-]+$')
);

CREATE INDEX idx_tenants_subdomain ON tenants(subdomain);
CREATE INDEX idx_tenants_status ON tenants(status);
CREATE INDEX idx_tenants_custom_domain ON tenants(custom_domain) WHERE custom_domain IS NOT NULL;

COMMENT ON TABLE tenants IS 'Companion profiles and configuration';
COMMENT ON COLUMN tenants.theme_config IS 'Colors, fonts, layout preferences (JSONB)';
COMMENT ON COLUMN tenants.content_config IS 'Bio, services, pricing, contact info (JSONB)';

-- ============================================================================
-- LOCATIONS (Companion Locations)
-- ============================================================================
CREATE TABLE locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Location details
  location_type VARCHAR(20) CHECK (location_type IN ('home', 'touring', 'available')),
  city VARCHAR(100) NOT NULL,
  state_province VARCHAR(100),
  country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2
  country_name VARCHAR(100),
  
  -- Geographic coordinates (for distance calculations)
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  
  -- Availability dates
  available_from DATE NOT NULL,
  available_until DATE,
  
  -- Status
  is_current BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true, -- Show on website?
  
  -- Additional info
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (available_until IS NULL OR available_until >= available_from)
);

CREATE INDEX idx_locations_tenant ON locations(tenant_id);
CREATE INDEX idx_locations_city ON locations(city);
CREATE INDEX idx_locations_country ON locations(country);
CREATE INDEX idx_locations_dates ON locations(available_from, available_until);
CREATE INDEX idx_locations_current ON locations(tenant_id, is_current) WHERE is_current = true;
CREATE INDEX idx_locations_coords ON locations(latitude, longitude) WHERE latitude IS NOT NULL;

COMMENT ON TABLE locations IS 'Companion location and touring schedule';
COMMENT ON COLUMN locations.location_type IS 'home = base location, touring = temporary visit, available = general availability';
COMMENT ON COLUMN locations.is_current IS 'Currently at this location';

-- ============================================================================
-- AVAILABILITY_CALENDAR (Companion Scheduling)
-- ============================================================================
CREATE TABLE availability_calendar (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Date and time
  date DATE NOT NULL,
  time_slot_start TIME,
  time_slot_end TIME,
  
  -- Status
  status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked', 'tentative')),
  
  -- All-day or specific time slots
  is_all_day BOOLEAN DEFAULT true,
  
  -- Minimum booking duration (in hours)
  min_duration_hours INT,
  
  -- Notes (private - not shown to clients)
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_time_slots CHECK (
    (is_all_day = true AND time_slot_start IS NULL AND time_slot_end IS NULL) OR
    (is_all_day = false AND time_slot_start IS NOT NULL AND time_slot_end IS NOT NULL AND time_slot_end > time_slot_start)
  )
);

CREATE INDEX idx_availability_tenant ON availability_calendar(tenant_id);
CREATE INDEX idx_availability_date ON availability_calendar(date);
CREATE INDEX idx_availability_tenant_date ON availability_calendar(tenant_id, date);
CREATE INDEX idx_availability_status ON availability_calendar(status);
CREATE INDEX idx_availability_date_range ON availability_calendar(tenant_id, date, status) 
  WHERE status IN ('available', 'tentative');

COMMENT ON TABLE availability_calendar IS 'Daily availability and booking schedule';
COMMENT ON COLUMN availability_calendar.status IS 'available = open for bookings, booked = confirmed booking, blocked = unavailable, tentative = pending confirmation';

-- ============================================================================
-- SESSIONS (User Visits)
-- ============================================================================
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  session_token VARCHAR(255) UNIQUE NOT NULL,
  fingerprint VARCHAR(255),
  
  -- UTM Parameters
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  utm_term VARCHAR(100),
  
  -- Request metadata
  referrer TEXT,
  user_agent TEXT,
  ip_address INET,
  ip_anonymized BOOLEAN DEFAULT true,
  
  -- Geographic data
  country VARCHAR(2),
  region VARCHAR(100),
  city VARCHAR(100),
  
  -- Device data
  device_type VARCHAR(20) CHECK (device_type IN ('mobile', 'tablet', 'desktop', 'unknown')),
  browser VARCHAR(50),
  browser_version VARCHAR(20),
  os VARCHAR(50),
  os_version VARCHAR(20),
  
  -- Entry point
  landing_page VARCHAR(500),
  
  -- Session tracking
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  page_views INT DEFAULT 1,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_sessions_tenant ON sessions(tenant_id);
CREATE INDEX idx_sessions_token ON sessions(session_token);
CREATE INDEX idx_sessions_fingerprint ON sessions(fingerprint);
CREATE INDEX idx_sessions_created ON sessions(created_at DESC);
CREATE INDEX idx_sessions_utm_source ON sessions(utm_source) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_sessions_device ON sessions(device_type);

COMMENT ON TABLE sessions IS 'User visit sessions with attribution data';
COMMENT ON COLUMN sessions.fingerprint IS 'Browser fingerprint for cross-session tracking';
COMMENT ON COLUMN sessions.ip_anonymized IS 'Whether IP last octet is masked (GDPR)';

-- ============================================================================
-- A/B TESTS
-- ============================================================================
CREATE TABLE ab_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  element_type VARCHAR(50) CHECK (element_type IN ('photo', 'text', 'layout', 'cta', 'pricing', 'other')),
  
  -- Variants configuration (JSONB array)
  variants JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [
  --   { "id": "control", "name": "Original", "config": {...}, "weight": 0.5 },
  --   { "id": "variant_a", "name": "New Hero", "config": {...}, "weight": 0.5 }
  -- ]
  
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('draft', 'active', 'paused', 'completed')),
  winner_variant_id VARCHAR(50),
  
  -- Statistical settings
  traffic_allocation DECIMAL(3,2) DEFAULT 1.00 CHECK (traffic_allocation >= 0 AND traffic_allocation <= 1),
  min_sample_size INT DEFAULT 100,
  confidence_level DECIMAL(3,2) DEFAULT 0.95,
  
  -- Timing
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ended_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_test_name_per_tenant UNIQUE(tenant_id, name)
);

CREATE INDEX idx_ab_tests_tenant ON ab_tests(tenant_id);
CREATE INDEX idx_ab_tests_status ON ab_tests(status);
CREATE INDEX idx_ab_tests_element_type ON ab_tests(element_type);

COMMENT ON TABLE ab_tests IS 'A/B test definitions and configuration';
COMMENT ON COLUMN ab_tests.variants IS 'Array of variant configurations with weights';
COMMENT ON COLUMN ab_tests.traffic_allocation IS 'Percentage of traffic to include (0.0-1.0)';

-- ============================================================================
-- A/B TEST ASSIGNMENTS
-- ============================================================================
CREATE TABLE ab_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  test_id UUID REFERENCES ab_tests(id) ON DELETE CASCADE,
  variant_id VARCHAR(50) NOT NULL,
  
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_session_test UNIQUE(session_id, test_id)
);

CREATE INDEX idx_ab_assignments_session ON ab_assignments(session_id);
CREATE INDEX idx_ab_assignments_test ON ab_assignments(test_id);
CREATE INDEX idx_ab_assignments_variant ON ab_assignments(variant_id);

COMMENT ON TABLE ab_assignments IS 'User assignments to A/B test variants';

-- ============================================================================
-- EVENTS (Conversion Tracking)
-- ============================================================================
CREATE TABLE events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  event_type VARCHAR(50) NOT NULL,
  -- Common event types:
  -- 'page_view', 'photo_click', 'photo_view', 'pricing_view',
  -- 'form_start', 'form_submit', 'email_click', 'phone_click',
  -- 'social_click', 'cta_click', 'gallery_open', 'testimonial_view'
  
  event_data JSONB DEFAULT '{}'::jsonb,
  -- Example: { "photo_id": 5, "position": 2, "variant": "hero_a" }
  
  page_url VARCHAR(500),
  page_title VARCHAR(255),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_tenant ON events(tenant_id);
CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_tenant_created ON events(tenant_id, created_at DESC);
CREATE INDEX idx_events_type_created ON events(event_type, created_at DESC);
CREATE INDEX idx_events_data ON events USING GIN (event_data);

COMMENT ON TABLE events IS 'User interaction events for analytics';
COMMENT ON COLUMN events.event_data IS 'Additional event metadata (JSONB)';

-- ============================================================================
-- BOOKINGS (Conversion Goal)
-- ============================================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  location_id UUID REFERENCES locations(id) ON DELETE SET NULL,
  availability_id UUID REFERENCES availability_calendar(id) ON DELETE SET NULL,
  
  -- Client information
  client_name VARCHAR(100) NOT NULL,
  client_email VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50),
  
  -- Booking details
  service_type VARCHAR(100),
  preferred_date TIMESTAMP WITH TIME ZONE,
  preferred_date_end TIMESTAMP WITH TIME ZONE,
  duration VARCHAR(50),
  duration_hours DECIMAL(4,2),
  
  -- Location context (captured at booking time)
  booking_city VARCHAR(100),
  booking_country VARCHAR(2),
  
  -- Client preferences
  outcall_address TEXT, -- For outcall bookings
  incall_location TEXT, -- For incall bookings
  message TEXT,
  
  -- Status tracking
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
  cancellation_reason TEXT,
  
  -- Analytics
  conversion_path JSONB DEFAULT '[]'::jsonb,
  -- Example: [
  --   { "event": "page_view", "timestamp": "...", "page": "/" },
  --   { "event": "photo_click", "timestamp": "...", "photo_id": 3 },
  --   { "event": "form_submit", "timestamp": "..." }
  -- ]
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  confirmed_at TIMESTAMP WITH TIME ZONE,
  cancelled_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Metadata
  notes TEXT,
  internal_notes TEXT,
  
  CONSTRAINT valid_booking_dates CHECK (preferred_date_end IS NULL OR preferred_date_end > preferred_date)
);

CREATE INDEX idx_bookings_tenant ON bookings(tenant_id);
CREATE INDEX idx_bookings_session ON bookings(session_id);
CREATE INDEX idx_bookings_location ON bookings(location_id);
CREATE INDEX idx_bookings_availability ON bookings(availability_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_tenant_created ON bookings(tenant_id, created_at DESC);
CREATE INDEX idx_bookings_email ON bookings(client_email);
CREATE INDEX idx_bookings_preferred_date ON bookings(preferred_date);
CREATE INDEX idx_bookings_city ON bookings(booking_city);
CREATE INDEX idx_bookings_date_status ON bookings(preferred_date, status) WHERE status IN ('confirmed', 'pending');

COMMENT ON TABLE bookings IS 'Booking submissions and conversions';
COMMENT ON COLUMN bookings.conversion_path IS 'Full user journey leading to booking (JSONB array)';
COMMENT ON COLUMN bookings.location_id IS 'Which location/city the booking is for';
COMMENT ON COLUMN bookings.availability_id IS 'Links to specific availability slot if booked';
COMMENT ON COLUMN bookings.booking_city IS 'City captured at booking time (snapshot for touring)';
COMMENT ON COLUMN bookings.duration_hours IS 'Numeric duration for calculations';

-- ============================================================================
-- PAYMENTS (Payment Processor Agnostic)
-- ============================================================================
CREATE TABLE payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  
  -- Payment processor info (agnostic design)
  processor VARCHAR(50) NOT NULL, -- 'stripe', 'square', 'paypal', 'venmo', 'cashapp', 'crypto', 'cash', 'bank_transfer', 'other'
  processor_transaction_id VARCHAR(255), -- External transaction ID from processor
  processor_customer_id VARCHAR(255), -- External customer ID (if applicable)
  processor_payment_method_id VARCHAR(255), -- External payment method ID (if applicable)
  
  -- Payment details
  amount DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD', -- ISO 4217 currency code
  
  -- Payment status (standardized across all processors)
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending',           -- Payment initiated
    'processing',        -- Payment being processed
    'completed',         -- Payment successful
    'failed',            -- Payment failed
    'cancelled',         -- Payment cancelled
    'refunded',          -- Payment refunded (full)
    'partially_refunded',-- Payment partially refunded
    'disputed',          -- Chargeback/dispute filed
    'expired'            -- Payment link/intent expired
  )),
  
  -- Payment type
  payment_type VARCHAR(20) CHECK (payment_type IN (
    'deposit',           -- Deposit payment
    'full_payment',      -- Full payment upfront
    'balance',           -- Balance payment
    'tip',               -- Tip/gratuity
    'cancellation_fee',  -- Cancellation fee
    'refund'             -- Refund transaction
  )),
  
  -- Fee tracking
  processor_fee DECIMAL(10, 2), -- Fee charged by payment processor
  net_amount DECIMAL(10, 2), -- Amount after fees (amount - processor_fee)
  
  -- Refund tracking
  refund_amount DECIMAL(10, 2) DEFAULT 0,
  refund_reason TEXT,
  refunded_at TIMESTAMP WITH TIME ZONE,
  
  -- Payment method details (for records/receipts)
  payment_method_type VARCHAR(50), -- 'card', 'bank_account', 'digital_wallet', 'crypto', 'cash'
  payment_method_last4 VARCHAR(4), -- Last 4 digits of card/account
  payment_method_brand VARCHAR(50), -- 'visa', 'mastercard', 'amex', 'bitcoin', etc.
  
  -- Metadata (processor-specific data stored as JSONB)
  processor_metadata JSONB DEFAULT '{}'::jsonb,
  -- Example: {
  --   "stripe_charge_id": "ch_xxx",
  --   "stripe_payment_intent": "pi_xxx",
  --   "receipt_url": "https://...",
  --   "card_country": "US",
  --   "risk_score": 12
  -- }
  
  -- Receipt generation
  receipt_number VARCHAR(50) UNIQUE, -- Human-readable receipt number
  receipt_url TEXT, -- URL to receipt (if hosted by processor)
  invoice_number VARCHAR(50), -- Optional invoice reference
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  
  -- Notes
  description TEXT, -- Payment description (e.g., "Dinner date - March 15")
  internal_notes TEXT, -- Private notes
  customer_notes TEXT -- Notes from customer (e.g., special requests)
);

CREATE INDEX idx_payments_tenant ON payments(tenant_id);
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_processor ON payments(processor);
CREATE INDEX idx_payments_status ON payments(status);
CREATE INDEX idx_payments_processor_txn ON payments(processor_transaction_id) WHERE processor_transaction_id IS NOT NULL;
CREATE INDEX idx_payments_receipt ON payments(receipt_number) WHERE receipt_number IS NOT NULL;
CREATE INDEX idx_payments_tenant_created ON payments(tenant_id, created_at DESC);
CREATE INDEX idx_payments_tenant_status ON payments(tenant_id, status);
CREATE INDEX idx_payments_completed ON payments(completed_at DESC) WHERE status = 'completed';

-- Trigger: Update updated_at on payment changes
CREATE TRIGGER update_payments_updated_at
  BEFORE UPDATE ON payments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE payments IS 'Payment processor agnostic payment tracking';
COMMENT ON COLUMN payments.processor IS 'Payment processor used (stripe, square, paypal, etc.)';
COMMENT ON COLUMN payments.processor_transaction_id IS 'External transaction ID from payment processor';
COMMENT ON COLUMN payments.processor_metadata IS 'Processor-specific data stored as JSONB for flexibility';
COMMENT ON COLUMN payments.receipt_number IS 'Human-readable receipt number for customer reference';
COMMENT ON COLUMN payments.net_amount IS 'Amount after processor fees deducted';

-- ============================================================================
-- SOCIAL MEDIA POSTS (Individual Post Tracking)
-- ============================================================================
CREATE TABLE social_media_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Platform details
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'twitter', 'x', 'facebook', 'tiktok', 'onlyfans', 'bluesky', 'threads', 'other')),
  platform_post_id VARCHAR(255), -- Native post ID from platform
  post_url TEXT NOT NULL,
  
  -- Post content
  post_type VARCHAR(50) CHECK (post_type IN ('photo', 'video', 'carousel', 'story', 'reel', 'tweet', 'thread', 'link', 'other')),
  caption TEXT,
  hashtags TEXT[], -- Array of hashtags used
  
  -- Post metadata
  posted_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Engagement metrics (updated periodically)
  likes INT DEFAULT 0,
  comments INT DEFAULT 0,
  shares INT DEFAULT 0,
  saves INT DEFAULT 0,
  views INT DEFAULT 0,
  reach INT,
  impressions INT,
  engagement_rate DECIMAL(5,2),
  
  -- UTM tracking (if post includes website link)
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(100),
  utm_content VARCHAR(100),
  
  -- Conversion tracking
  tracked_clicks INT DEFAULT 0,
  tracked_sessions INT DEFAULT 0,
  tracked_bookings INT DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_promoted BOOLEAN DEFAULT false, -- Paid promotion?
  promotion_budget DECIMAL(10,2),
  
  -- Raw data from platform API
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_synced_at TIMESTAMP WITH TIME ZONE
);

CREATE INDEX idx_social_posts_tenant ON social_media_posts(tenant_id);
CREATE INDEX idx_social_posts_platform ON social_media_posts(platform);
CREATE INDEX idx_social_posts_posted_at ON social_media_posts(posted_at DESC);
CREATE INDEX idx_social_posts_tenant_posted ON social_media_posts(tenant_id, posted_at DESC);
CREATE INDEX idx_social_posts_platform_post_id ON social_media_posts(platform, platform_post_id) WHERE platform_post_id IS NOT NULL;
CREATE INDEX idx_social_posts_utm ON social_media_posts(utm_source, utm_campaign) WHERE utm_source IS NOT NULL;
CREATE INDEX idx_social_posts_active ON social_media_posts(tenant_id, is_active) WHERE is_active = true;

COMMENT ON TABLE social_media_posts IS 'Individual social media posts with engagement and conversion tracking';
COMMENT ON COLUMN social_media_posts.platform_post_id IS 'Native ID from platform (e.g., Instagram post ID, Tweet ID)';
COMMENT ON COLUMN social_media_posts.tracked_clicks IS 'Clicks tracked via UTM parameters';
COMMENT ON COLUMN social_media_posts.tracked_sessions IS 'Website sessions attributed to this post';
COMMENT ON COLUMN social_media_posts.tracked_bookings IS 'Bookings attributed to this post';

-- ============================================================================
-- SOCIAL MEDIA POST CONVERSIONS (Attribution Junction Table)
-- ============================================================================
CREATE TABLE social_media_post_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Links
  post_id UUID REFERENCES social_media_posts(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  -- Conversion details
  conversion_type VARCHAR(50) NOT NULL CHECK (conversion_type IN ('click', 'session', 'page_view', 'booking', 'form_start', 'email_click', 'phone_click')),
  
  -- Attribution
  is_first_touch BOOLEAN DEFAULT false, -- First interaction in user journey
  is_last_touch BOOLEAN DEFAULT false,  -- Last interaction before conversion
  time_to_conversion INTERVAL, -- Time from click to booking
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_post_session_type UNIQUE(post_id, session_id, conversion_type)
);

CREATE INDEX idx_post_conversions_post ON social_media_post_conversions(post_id);
CREATE INDEX idx_post_conversions_session ON social_media_post_conversions(session_id);
CREATE INDEX idx_post_conversions_booking ON social_media_post_conversions(booking_id);
CREATE INDEX idx_post_conversions_tenant ON social_media_post_conversions(tenant_id);
CREATE INDEX idx_post_conversions_type ON social_media_post_conversions(conversion_type);
CREATE INDEX idx_post_conversions_first_touch ON social_media_post_conversions(post_id, is_first_touch) WHERE is_first_touch = true;
CREATE INDEX idx_post_conversions_last_touch ON social_media_post_conversions(post_id, is_last_touch) WHERE is_last_touch = true;

COMMENT ON TABLE social_media_post_conversions IS 'Attribution tracking linking social posts to sessions and bookings';
COMMENT ON COLUMN social_media_post_conversions.is_first_touch IS 'First touchpoint in user journey (entered via this post)';
COMMENT ON COLUMN social_media_post_conversions.is_last_touch IS 'Last touchpoint before booking (booked after seeing this post)';

-- ============================================================================
-- SOCIAL MEDIA METRICS (Daily Account-Level Metrics)
-- ============================================================================
CREATE TABLE social_media_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  
  platform VARCHAR(50) NOT NULL CHECK (platform IN ('instagram', 'twitter', 'x', 'facebook', 'tiktok', 'onlyfans', 'bluesky', 'threads', 'other')),
  metric_date DATE NOT NULL,
  
  -- Account-level metrics
  followers INT,
  following INT,
  engagement_rate DECIMAL(5,2),
  posts_count INT,
  reach INT,
  impressions INT,
  profile_views INT,
  website_clicks INT,
  
  -- Raw data from API
  raw_data JSONB DEFAULT '{}'::jsonb,
  
  imported_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT unique_tenant_platform_date UNIQUE(tenant_id, platform, metric_date)
);

CREATE INDEX idx_social_metrics_tenant ON social_media_metrics(tenant_id);
CREATE INDEX idx_social_metrics_platform ON social_media_metrics(platform);
CREATE INDEX idx_social_metrics_date ON social_media_metrics(metric_date DESC);

COMMENT ON TABLE social_media_metrics IS 'Daily account-level social media metrics for correlation analysis';
COMMENT ON COLUMN social_media_metrics.raw_data IS 'Full API response for future analysis';

-- ============================================================================
-- ANALYTICS VIEWS
-- ============================================================================

-- View: Tenant Performance Summary
CREATE OR REPLACE VIEW v_tenant_performance AS
SELECT 
  t.id AS tenant_id,
  t.name AS tenant_name,
  t.subdomain,
  COUNT(DISTINCT s.id) AS total_sessions,
  COUNT(DISTINCT s.fingerprint) AS unique_visitors,
  COUNT(DISTINCT b.id) AS total_bookings,
  CASE 
    WHEN COUNT(DISTINCT s.id) > 0 
    THEN ROUND((COUNT(DISTINCT b.id)::DECIMAL / COUNT(DISTINCT s.id)::DECIMAL * 100), 2)
    ELSE 0 
  END AS conversion_rate,
  COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'photo_click') AS photo_clicks,
  COUNT(DISTINCT e.id) FILTER (WHERE e.event_type = 'form_start') AS form_starts,
  MAX(s.created_at) AS last_visit
FROM tenants t
LEFT JOIN sessions s ON t.id = s.tenant_id
LEFT JOIN bookings b ON t.id = b.tenant_id
LEFT JOIN events e ON t.id = e.tenant_id
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.subdomain;

-- View: A/B Test Results
CREATE OR REPLACE VIEW v_ab_test_results AS
SELECT 
  t.name AS test_name,
  t.tenant_id,
  t.element_type,
  v.variant->>'id' AS variant_id,
  v.variant->>'name' AS variant_name,
  COUNT(DISTINCT a.session_id) AS assignments,
  COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_type = 'photo_view') AS views,
  COUNT(DISTINCT b.session_id) AS conversions,
  CASE 
    WHEN COUNT(DISTINCT e.session_id) FILTER (WHERE e.event_type = 'photo_view') > 0
    THEN ROUND((COUNT(DISTINCT b.session_id)::DECIMAL / COUNT(DISTINCT e.session_id)::DECIMAL * 100), 2)
    ELSE 0
  END AS conversion_rate
FROM ab_tests t
CROSS JOIN LATERAL jsonb_array_elements(t.variants) AS v(variant)
LEFT JOIN ab_assignments a ON t.id = a.test_id AND a.variant_id = v.variant->>'id'
LEFT JOIN events e ON a.session_id = e.session_id
LEFT JOIN bookings b ON a.session_id = b.session_id
WHERE t.status = 'active'
GROUP BY t.id, t.name, t.tenant_id, t.element_type, v.variant;

-- View: Traffic Sources
CREATE OR REPLACE VIEW v_traffic_sources AS
SELECT 
  tenant_id,
  COALESCE(utm_source, 'direct') AS source,
  COALESCE(utm_medium, 'none') AS medium,
  COUNT(DISTINCT id) AS sessions,
  COUNT(DISTINCT fingerprint) AS unique_visitors,
  COUNT(DISTINCT CASE WHEN id IN (SELECT session_id FROM bookings) THEN id END) AS conversions
FROM sessions
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY tenant_id, utm_source, utm_medium;

-- View: Location-based booking analytics
CREATE OR REPLACE VIEW v_location_bookings AS
SELECT 
  t.id AS tenant_id,
  t.name AS tenant_name,
  l.city,
  l.country,
  l.location_type,
  COUNT(b.id) AS total_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'confirmed') AS confirmed_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'completed') AS completed_bookings,
  COUNT(b.id) FILTER (WHERE b.status = 'cancelled') AS cancelled_bookings,
  AVG(b.duration_hours) FILTER (WHERE b.duration_hours IS NOT NULL) AS avg_duration_hours,
  MIN(b.preferred_date) AS first_booking_date,
  MAX(b.preferred_date) AS last_booking_date
FROM tenants t
LEFT JOIN locations l ON t.id = l.tenant_id
LEFT JOIN bookings b ON l.id = b.location_id
WHERE l.is_public = true
GROUP BY t.id, t.name, l.city, l.country, l.location_type;

-- View: Availability utilization
CREATE OR REPLACE VIEW v_availability_utilization AS
SELECT 
  t.id AS tenant_id,
  t.name AS tenant_name,
  ac.date,
  l.city,
  l.country,
  COUNT(*) AS total_slots,
  COUNT(*) FILTER (WHERE ac.status = 'available') AS available_slots,
  COUNT(*) FILTER (WHERE ac.status = 'booked') AS booked_slots,
  COUNT(*) FILTER (WHERE ac.status = 'blocked') AS blocked_slots,
  ROUND((COUNT(*) FILTER (WHERE ac.status = 'booked')::DECIMAL / NULLIF(COUNT(*), 0) * 100), 2) AS utilization_rate
FROM tenants t
JOIN availability_calendar ac ON t.id = ac.tenant_id
LEFT JOIN locations l ON t.id = l.tenant_id 
  AND ac.date BETWEEN l.available_from AND COALESCE(l.available_until, ac.date)
WHERE ac.date >= CURRENT_DATE - INTERVAL '30 days'
GROUP BY t.id, t.name, ac.date, l.city, l.country;

-- View: Social media post performance
CREATE OR REPLACE VIEW v_social_post_performance AS
SELECT 
  p.id AS post_id,
  p.tenant_id,
  t.name AS tenant_name,
  p.platform,
  p.post_type,
  p.posted_at,
  p.post_url,
  p.is_promoted,
  
  -- Engagement metrics
  p.likes,
  p.comments,
  p.shares,
  p.views,
  p.engagement_rate,
  
  -- Conversion metrics
  COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'click') AS total_clicks,
  COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') AS total_sessions,
  COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking') AS total_bookings,
  
  -- Attribution
  COUNT(DISTINCT c.session_id) FILTER (WHERE c.is_first_touch = true) AS first_touch_sessions,
  COUNT(DISTINCT c.booking_id) FILTER (WHERE c.is_last_touch = true) AS last_touch_bookings,
  
  -- Conversion rate
  CASE 
    WHEN COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') > 0
    THEN ROUND((COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking')::DECIMAL / 
                COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session')::DECIMAL * 100), 2)
    ELSE 0
  END AS conversion_rate_pct,
  
  -- ROI (if promoted)
  CASE 
    WHEN p.promotion_budget > 0 AND COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking') > 0
    THEN ROUND(p.promotion_budget / COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking'), 2)
    ELSE NULL
  END AS cost_per_booking,
  
  -- UTM tracking
  p.utm_source,
  p.utm_campaign,
  
  p.created_at
FROM social_media_posts p
LEFT JOIN social_media_post_conversions c ON p.id = c.post_id
LEFT JOIN tenants t ON p.tenant_id = t.id
GROUP BY 
  p.id, p.tenant_id, t.name, p.platform, p.post_type, p.posted_at, 
  p.post_url, p.is_promoted, p.likes, p.comments, p.shares, p.views, 
  p.engagement_rate, p.utm_source, p.utm_campaign, p.promotion_budget, p.created_at;

-- View: Platform performance comparison
CREATE OR REPLACE VIEW v_platform_performance AS
SELECT 
  p.tenant_id,
  t.name AS tenant_name,
  p.platform,
  COUNT(DISTINCT p.id) AS total_posts,
  COUNT(DISTINCT p.id) FILTER (WHERE p.is_promoted = true) AS promoted_posts,
  
  -- Engagement totals
  SUM(p.likes) AS total_likes,
  SUM(p.comments) AS total_comments,
  SUM(p.shares) AS total_shares,
  SUM(p.views) AS total_views,
  AVG(p.engagement_rate) AS avg_engagement_rate,
  
  -- Conversion totals
  COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') AS total_sessions,
  COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking') AS total_bookings,
  
  -- Conversion rates
  CASE 
    WHEN COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') > 0
    THEN ROUND((COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking')::DECIMAL / 
                COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session')::DECIMAL * 100), 2)
    ELSE 0
  END AS conversion_rate_pct,
  
  -- ROI metrics
  SUM(p.promotion_budget) FILTER (WHERE p.is_promoted = true) AS total_ad_spend,
  CASE 
    WHEN SUM(p.promotion_budget) FILTER (WHERE p.is_promoted = true) > 0
    THEN ROUND(SUM(p.promotion_budget) FILTER (WHERE p.is_promoted = true) / 
               NULLIF(COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking'), 0), 2)
    ELSE NULL
  END AS avg_cost_per_booking,
  
  MAX(p.posted_at) AS last_post_date
FROM social_media_posts p
LEFT JOIN social_media_post_conversions c ON p.id = c.post_id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.posted_at >= NOW() - INTERVAL '90 days'
GROUP BY p.tenant_id, t.name, p.platform;

-- View: Top performing posts
CREATE OR REPLACE VIEW v_top_posts AS
SELECT 
  p.id AS post_id,
  p.tenant_id,
  t.name AS tenant_name,
  p.platform,
  p.post_type,
  p.posted_at,
  p.post_url,
  SUBSTRING(p.caption, 1, 100) AS caption_preview,
  
  -- Engagement
  p.likes,
  p.comments,
  p.views,
  p.engagement_rate,
  
  -- Conversions
  COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking') AS bookings,
  COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') AS sessions,
  
  -- Performance score (weighted)
  (COALESCE(p.engagement_rate, 0) * 0.3) + 
  (COALESCE(COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session'), 0) * 0.3) +
  (COALESCE(COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking'), 0) * 10) AS performance_score
FROM social_media_posts p
LEFT JOIN social_media_post_conversions c ON p.id = c.post_id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.posted_at >= NOW() - INTERVAL '90 days'
GROUP BY 
  p.id, p.tenant_id, t.name, p.platform, p.post_type, p.posted_at,
  p.post_url, p.caption, p.likes, p.comments, p.views, p.engagement_rate
ORDER BY performance_score DESC;

-- View: Payment Analytics (Revenue by tenant, processor, status)
CREATE OR REPLACE VIEW v_payment_analytics AS
SELECT 
  t.id AS tenant_id,
  t.name AS tenant_name,
  t.subdomain,
  
  -- Payment counts
  COUNT(p.id) AS total_payments,
  COUNT(p.id) FILTER (WHERE p.status = 'completed') AS completed_payments,
  COUNT(p.id) FILTER (WHERE p.status = 'pending') AS pending_payments,
  COUNT(p.id) FILTER (WHERE p.status = 'failed') AS failed_payments,
  COUNT(p.id) FILTER (WHERE p.status = 'refunded') AS refunded_payments,
  
  -- Revenue (completed payments only)
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue,
  COALESCE(SUM(p.net_amount) FILTER (WHERE p.status = 'completed'), 0) AS net_revenue,
  COALESCE(SUM(p.processor_fee) FILTER (WHERE p.status = 'completed'), 0) AS total_fees,
  COALESCE(SUM(p.refund_amount), 0) AS total_refunds,
  
  -- Payment type breakdown (completed only)
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'deposit'), 0) AS deposit_revenue,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'full_payment'), 0) AS full_payment_revenue,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'balance'), 0) AS balance_revenue,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed' AND p.payment_type = 'tip'), 0) AS tip_revenue,
  
  -- Averages
  ROUND(AVG(p.amount) FILTER (WHERE p.status = 'completed'), 2) AS avg_payment_amount,
  ROUND(AVG(p.processor_fee) FILTER (WHERE p.status = 'completed'), 2) AS avg_processor_fee,
  
  -- Date ranges
  MIN(p.completed_at) AS first_payment_date,
  MAX(p.completed_at) AS last_payment_date
  
FROM tenants t
LEFT JOIN payments p ON t.id = p.tenant_id
GROUP BY t.id, t.name, t.subdomain;

-- View: Payment by Processor (Compare different payment processors)
CREATE OR REPLACE VIEW v_payment_by_processor AS
SELECT 
  p.tenant_id,
  t.name AS tenant_name,
  p.processor,
  p.currency,
  
  -- Counts
  COUNT(p.id) AS total_transactions,
  COUNT(p.id) FILTER (WHERE p.status = 'completed') AS successful_transactions,
  COUNT(p.id) FILTER (WHERE p.status = 'failed') AS failed_transactions,
  
  -- Success rate
  ROUND(
    (COUNT(p.id) FILTER (WHERE p.status = 'completed')::DECIMAL / 
     NULLIF(COUNT(p.id), 0) * 100), 2
  ) AS success_rate_pct,
  
  -- Revenue
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_revenue,
  COALESCE(SUM(p.processor_fee) FILTER (WHERE p.status = 'completed'), 0) AS total_fees,
  COALESCE(SUM(p.net_amount) FILTER (WHERE p.status = 'completed'), 0) AS net_revenue,
  
  -- Fee percentage
  ROUND(
    CASE 
      WHEN SUM(p.amount) FILTER (WHERE p.status = 'completed') > 0 
      THEN (SUM(p.processor_fee) FILTER (WHERE p.status = 'completed')::DECIMAL / 
            SUM(p.amount) FILTER (WHERE p.status = 'completed') * 100)
      ELSE 0
    END, 2
  ) AS avg_fee_pct,
  
  -- Averages
  ROUND(AVG(p.amount) FILTER (WHERE p.status = 'completed'), 2) AS avg_transaction_amount,
  
  -- Time range
  MIN(p.completed_at) AS first_transaction_date,
  MAX(p.completed_at) AS last_transaction_date
  
FROM payments p
LEFT JOIN tenants t ON p.tenant_id = t.id
GROUP BY p.tenant_id, t.name, p.processor, p.currency;

-- View: Booking Revenue (Link bookings to payments)
CREATE OR REPLACE VIEW v_booking_revenue AS
SELECT 
  b.id AS booking_id,
  b.tenant_id,
  t.name AS tenant_name,
  b.client_name,
  b.client_email,
  b.service_type,
  b.preferred_date,
  b.status AS booking_status,
  b.booking_city,
  
  -- Payment summary
  COUNT(p.id) AS payment_count,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'completed'), 0) AS total_paid,
  COALESCE(SUM(p.amount) FILTER (WHERE p.status = 'pending'), 0) AS pending_amount,
  COALESCE(SUM(p.refund_amount), 0) AS refunded_amount,
  
  -- Payment breakdown
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'deposit' AND p.status = 'completed'), 0) AS deposit_paid,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'full_payment' AND p.status = 'completed'), 0) AS full_payment_paid,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'balance' AND p.status = 'completed'), 0) AS balance_paid,
  COALESCE(SUM(p.amount) FILTER (WHERE p.payment_type = 'tip' AND p.status = 'completed'), 0) AS tips_received,
  
  -- Payment status
  CASE 
    WHEN COUNT(p.id) FILTER (WHERE p.status = 'completed') > 0 THEN 'paid'
    WHEN COUNT(p.id) FILTER (WHERE p.status = 'pending') > 0 THEN 'pending'
    WHEN COUNT(p.id) FILTER (WHERE p.status = 'failed') > 0 THEN 'failed'
    ELSE 'unpaid'
  END AS payment_status,
  
  -- Latest payment info
  MAX(p.completed_at) AS last_payment_date,
  STRING_AGG(DISTINCT p.processor, ', ') AS processors_used
  
FROM bookings b
LEFT JOIN payments p ON b.id = p.booking_id
LEFT JOIN tenants t ON b.tenant_id = t.id
GROUP BY 
  b.id, b.tenant_id, t.name, b.client_name, b.client_email, 
  b.service_type, b.preferred_date, b.status, b.booking_city;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function: Update tenant updated_at timestamp
CREATE OR REPLACE FUNCTION update_tenant_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_tenant_timestamp
BEFORE UPDATE ON tenants
FOR EACH ROW
EXECUTE FUNCTION update_tenant_timestamp();

-- Function: Update ab_test updated_at timestamp
CREATE OR REPLACE FUNCTION update_ab_test_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_ab_test_timestamp
BEFORE UPDATE ON ab_tests
FOR EACH ROW
EXECUTE FUNCTION update_ab_test_timestamp();

-- Function: Update location updated_at timestamp
CREATE OR REPLACE FUNCTION update_location_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_location_timestamp
BEFORE UPDATE ON locations
FOR EACH ROW
EXECUTE FUNCTION update_location_timestamp();

-- Function: Update availability updated_at timestamp
CREATE OR REPLACE FUNCTION update_availability_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_availability_timestamp
BEFORE UPDATE ON availability_calendar
FOR EACH ROW
EXECUTE FUNCTION update_availability_timestamp();

-- Function: Auto-mark availability as booked when booking confirmed
CREATE OR REPLACE FUNCTION update_availability_on_booking()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking is confirmed and linked to availability slot, mark it as booked
  IF NEW.status = 'confirmed' AND NEW.availability_id IS NOT NULL THEN
    UPDATE availability_calendar
    SET status = 'booked'
    WHERE id = NEW.availability_id;
  END IF;
  
  -- If booking is cancelled, set availability back to available
  IF NEW.status = 'cancelled' AND OLD.availability_id IS NOT NULL THEN
    UPDATE availability_calendar
    SET status = 'available'
    WHERE id = OLD.availability_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_availability_on_booking
AFTER INSERT OR UPDATE ON bookings
FOR EACH ROW
EXECUTE FUNCTION update_availability_on_booking();

-- Function: Anonymize IP address (GDPR compliance)
CREATE OR REPLACE FUNCTION anonymize_ip(ip_addr INET)
RETURNS INET AS $$
BEGIN
  -- Mask last octet for IPv4, last 80 bits for IPv6
  IF family(ip_addr) = 4 THEN
    RETURN set_masklen(ip_addr, 24);
  ELSE
    RETURN set_masklen(ip_addr, 48);
  END IF;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Function: Calculate conversion funnel
CREATE OR REPLACE FUNCTION get_conversion_funnel(p_tenant_id UUID, p_start_date TIMESTAMP, p_end_date TIMESTAMP)
RETURNS TABLE (
  stage VARCHAR,
  count BIGINT,
  percentage DECIMAL
) AS $$
DECLARE
  total_sessions BIGINT;
BEGIN
  SELECT COUNT(DISTINCT id) INTO total_sessions
  FROM sessions
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date;
  
  IF total_sessions = 0 THEN
    total_sessions := 1;  -- Avoid division by zero
  END IF;
  
  RETURN QUERY
  SELECT 'Page Views'::VARCHAR, 
         total_sessions,
         (100.0)::DECIMAL
  UNION ALL
  SELECT 'Photo Clicks'::VARCHAR,
         COUNT(DISTINCT session_id),
         ROUND((COUNT(DISTINCT session_id)::DECIMAL / total_sessions * 100), 2)
  FROM events
  WHERE tenant_id = p_tenant_id
    AND event_type = 'photo_click'
    AND created_at BETWEEN p_start_date AND p_end_date
  UNION ALL
  SELECT 'Pricing Views'::VARCHAR,
         COUNT(DISTINCT session_id),
         ROUND((COUNT(DISTINCT session_id)::DECIMAL / total_sessions * 100), 2)
  FROM events
  WHERE tenant_id = p_tenant_id
    AND event_type = 'pricing_view'
    AND created_at BETWEEN p_start_date AND p_end_date
  UNION ALL
  SELECT 'Form Starts'::VARCHAR,
         COUNT(DISTINCT session_id),
         ROUND((COUNT(DISTINCT session_id)::DECIMAL / total_sessions * 100), 2)
  FROM events
  WHERE tenant_id = p_tenant_id
    AND event_type = 'form_start'
    AND created_at BETWEEN p_start_date AND p_end_date
  UNION ALL
  SELECT 'Bookings'::VARCHAR,
         COUNT(DISTINCT id),
         ROUND((COUNT(DISTINCT id)::DECIMAL / total_sessions * 100), 2)
  FROM bookings
  WHERE tenant_id = p_tenant_id
    AND created_at BETWEEN p_start_date AND p_end_date;
END;
$$ LANGUAGE plpgsql;

-- Function: Get companion's current location
CREATE OR REPLACE FUNCTION get_current_location(p_tenant_id UUID)
RETURNS TABLE (
  location_id UUID,
  city VARCHAR,
  state_province VARCHAR,
  country VARCHAR,
  available_from DATE,
  available_until DATE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.city,
    l.state_province,
    l.country,
    l.available_from,
    l.available_until
  FROM locations l
  WHERE l.tenant_id = p_tenant_id
    AND l.is_current = true
    AND l.is_public = true
  ORDER BY l.available_from DESC
  LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function: Get companion's touring schedule
CREATE OR REPLACE FUNCTION get_touring_schedule(p_tenant_id UUID, p_days_ahead INT DEFAULT 90)
RETURNS TABLE (
  location_id UUID,
  location_type VARCHAR,
  city VARCHAR,
  state_province VARCHAR,
  country VARCHAR,
  available_from DATE,
  available_until DATE,
  days_available INT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.id,
    l.location_type,
    l.city,
    l.state_province,
    l.country,
    l.available_from,
    l.available_until,
    CASE 
      WHEN l.available_until IS NULL THEN NULL
      ELSE (l.available_until - l.available_from)::INT
    END AS days_available
  FROM locations l
  WHERE l.tenant_id = p_tenant_id
    AND l.is_public = true
    AND l.available_from <= CURRENT_DATE + p_days_ahead
    AND (l.available_until IS NULL OR l.available_until >= CURRENT_DATE)
  ORDER BY l.available_from ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Check availability for specific date
CREATE OR REPLACE FUNCTION check_availability(
  p_tenant_id UUID,
  p_date DATE,
  p_duration_hours INT DEFAULT NULL
)
RETURNS TABLE (
  is_available BOOLEAN,
  availability_id UUID,
  status VARCHAR,
  time_slot_start TIME,
  time_slot_end TIME,
  location_city VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE WHEN ac.status = 'available' THEN true ELSE false END,
    ac.id,
    ac.status,
    ac.time_slot_start,
    ac.time_slot_end,
    l.city
  FROM availability_calendar ac
  LEFT JOIN locations l ON l.tenant_id = ac.tenant_id 
    AND p_date BETWEEN l.available_from AND COALESCE(l.available_until, p_date)
  WHERE ac.tenant_id = p_tenant_id
    AND ac.date = p_date
    AND (p_duration_hours IS NULL OR ac.min_duration_hours IS NULL OR p_duration_hours >= ac.min_duration_hours)
  ORDER BY ac.time_slot_start NULLS FIRST;
END;
$$ LANGUAGE plpgsql;

-- Function: Get available dates in date range
CREATE OR REPLACE FUNCTION get_available_dates(
  p_tenant_id UUID,
  p_start_date DATE,
  p_end_date DATE
)
RETURNS TABLE (
  date DATE,
  availability_count INT,
  city VARCHAR
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ac.date,
    COUNT(*)::INT AS availability_count,
    l.city
  FROM availability_calendar ac
  LEFT JOIN locations l ON l.tenant_id = ac.tenant_id 
    AND ac.date BETWEEN l.available_from AND COALESCE(l.available_until, ac.date)
  WHERE ac.tenant_id = p_tenant_id
    AND ac.date BETWEEN p_start_date AND p_end_date
    AND ac.status IN ('available', 'tentative')
  GROUP BY ac.date, l.city
  ORDER BY ac.date ASC;
END;
$$ LANGUAGE plpgsql;

-- Function: Track social media post conversion
CREATE OR REPLACE FUNCTION track_social_post_conversion(
  p_post_id UUID,
  p_session_id UUID,
  p_booking_id UUID DEFAULT NULL,
  p_conversion_type VARCHAR DEFAULT 'session'
)
RETURNS UUID AS $$
DECLARE
  v_conversion_id UUID;
  v_tenant_id UUID;
  v_is_first BOOLEAN;
  v_is_last BOOLEAN;
BEGIN
  -- Get tenant_id
  SELECT tenant_id INTO v_tenant_id FROM sessions WHERE id = p_session_id;
  
  -- Check if this is first touch (no prior conversions for this session)
  SELECT NOT EXISTS (
    SELECT 1 FROM social_media_post_conversions WHERE session_id = p_session_id
  ) INTO v_is_first;
  
  -- Check if this is last touch (conversion_type = 'booking')
  v_is_last := (p_conversion_type = 'booking');
  
  -- Insert or update conversion
  INSERT INTO social_media_post_conversions (
    post_id, session_id, booking_id, tenant_id, 
    conversion_type, is_first_touch, is_last_touch
  )
  VALUES (
    p_post_id, p_session_id, p_booking_id, v_tenant_id,
    p_conversion_type, v_is_first, v_is_last
  )
  ON CONFLICT (post_id, session_id, conversion_type) 
  DO UPDATE SET
    booking_id = EXCLUDED.booking_id,
    is_last_touch = EXCLUDED.is_last_touch
  RETURNING id INTO v_conversion_id;
  
  -- Update post's tracked counts
  UPDATE social_media_posts
  SET 
    tracked_clicks = (SELECT COUNT(DISTINCT session_id) FROM social_media_post_conversions WHERE post_id = p_post_id AND conversion_type = 'click'),
    tracked_sessions = (SELECT COUNT(DISTINCT session_id) FROM social_media_post_conversions WHERE post_id = p_post_id AND conversion_type = 'session'),
    tracked_bookings = (SELECT COUNT(DISTINCT booking_id) FROM social_media_post_conversions WHERE post_id = p_post_id AND conversion_type = 'booking' AND booking_id IS NOT NULL)
  WHERE id = p_post_id;
  
  RETURN v_conversion_id;
END;
$$ LANGUAGE plpgsql;

-- Function: Get post performance for date range
CREATE OR REPLACE FUNCTION get_post_performance(
  p_tenant_id UUID,
  p_start_date TIMESTAMP,
  p_end_date TIMESTAMP,
  p_platform VARCHAR DEFAULT NULL
)
RETURNS TABLE (
  post_id UUID,
  platform VARCHAR,
  posted_at TIMESTAMP WITH TIME ZONE,
  post_url TEXT,
  likes INT,
  comments INT,
  views INT,
  sessions BIGINT,
  bookings BIGINT,
  conversion_rate DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.platform,
    p.posted_at,
    p.post_url,
    p.likes,
    p.comments,
    p.views,
    COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session'),
    COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking'),
    CASE 
      WHEN COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session') > 0
      THEN ROUND((COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking')::DECIMAL / 
                  COUNT(DISTINCT c.session_id) FILTER (WHERE c.conversion_type = 'session')::DECIMAL * 100), 2)
      ELSE 0
    END
  FROM social_media_posts p
  LEFT JOIN social_media_post_conversions c ON p.id = c.post_id
  WHERE p.tenant_id = p_tenant_id
    AND p.posted_at BETWEEN p_start_date AND p_end_date
    AND (p_platform IS NULL OR p.platform = p_platform)
  GROUP BY p.id, p.platform, p.posted_at, p.post_url, p.likes, p.comments, p.views
  ORDER BY p.posted_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function: Get best performing hashtags
CREATE OR REPLACE FUNCTION get_top_hashtags(
  p_tenant_id UUID,
  p_days_back INT DEFAULT 90,
  p_limit INT DEFAULT 20
)
RETURNS TABLE (
  hashtag TEXT,
  post_count BIGINT,
  avg_engagement_rate DECIMAL,
  total_bookings BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    UNNEST(p.hashtags) AS hashtag,
    COUNT(DISTINCT p.id) AS post_count,
    ROUND(AVG(p.engagement_rate), 2) AS avg_engagement_rate,
    COUNT(DISTINCT c.booking_id) FILTER (WHERE c.conversion_type = 'booking') AS total_bookings
  FROM social_media_posts p
  LEFT JOIN social_media_post_conversions c ON p.id = c.post_id
  WHERE p.tenant_id = p_tenant_id
    AND p.posted_at >= NOW() - (p_days_back || ' days')::INTERVAL
    AND p.hashtags IS NOT NULL
    AND array_length(p.hashtags, 1) > 0
  GROUP BY UNNEST(p.hashtags)
  ORDER BY total_bookings DESC, avg_engagement_rate DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- INITIAL DATA (Optional)
-- ============================================================================

-- Insert initial tenant (Claire Hamilton) - will be updated with actual data
-- Commented out for now - will be inserted via application
/*
INSERT INTO tenants (subdomain, name, email, theme_config, content_config, status)
VALUES (
  'claire',
  'Claire Hamilton',
  'claire@companionconnect.app',
  '{"colors": {"primary": "#8B4789", "secondary": "#D4AF37"}, "fonts": {"heading": "Playfair Display", "body": "Montserrat"}}'::jsonb,
  '{"name": "Claire Hamilton", "tagline": "Sydney''s Premier Luxury Companion"}'::jsonb,
  'active'
);
*/

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

-- COMMENT ON DATABASE defaultdb IS 'Multi-tenant companion platform with analytics and A/B testing';
-- Note: Commenting out DATABASE comment as it requires superuser privileges

-- ============================================================================
-- PERMISSIONS (Update with actual database user)
-- ============================================================================

-- GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
-- GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO app_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO app_user;

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
