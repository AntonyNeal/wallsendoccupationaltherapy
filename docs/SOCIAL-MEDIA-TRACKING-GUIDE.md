# Social Media Conversion Tracking System

## Overview

Complete social media post-level conversion tracking across all platforms. Track which posts drive bookings, analyze platform performance, and measure ROI on promoted content.

---

## Database Tables

### `social_media_posts`

**Individual post tracking with engagement metrics**

Every Instagram photo, tweet, TikTok video, etc. gets its own record.

**Key Fields:**

```sql
platform              -- 'instagram', 'twitter', 'x', 'tiktok', 'onlyfans', 'bluesky', etc.
platform_post_id      -- Native ID (Instagram post ID, Tweet ID)
post_url              -- Direct link to post
post_type             -- 'photo', 'video', 'carousel', 'story', 'reel', 'tweet'
caption               -- Post text content
hashtags              -- Array: ['photography', 'sydney', 'companion']
posted_at             -- When it was posted

-- Engagement (updated periodically)
likes, comments, shares, saves, views, reach, impressions
engagement_rate       -- Calculated engagement percentage

-- UTM tracking (for links in bio/posts)
utm_source, utm_medium, utm_campaign, utm_content

-- Conversion tracking (auto-calculated)
tracked_clicks        -- Clicks from this post
tracked_sessions      -- Website sessions from this post
tracked_bookings      -- Bookings attributed to this post

-- Promotion info
is_promoted           -- Paid ad?
promotion_budget      -- Ad spend amount
```

**Example Insert:**

```sql
INSERT INTO social_media_posts (
  tenant_id, platform, platform_post_id, post_url, post_type,
  caption, hashtags, posted_at, utm_source, utm_campaign
) VALUES (
  'claire-id',
  'instagram',
  'C_abc123xyz',
  'https://instagram.com/p/abc123xyz',
  'photo',
  'Available in Sydney this weekend! 💕',
  ARRAY['sydney', 'companion', 'gfe', 'luxury'],
  '2025-12-05 14:30:00+10',
  'instagram',
  'sydney_dec_weekend'
);
```

### `social_media_post_conversions`

**Attribution junction table linking posts → sessions → bookings**

Tracks every step of the user journey from social post to booking.

**Key Fields:**

```sql
post_id               -- Which post
session_id            -- Which website visit
booking_id            -- Which booking (if converted)
tenant_id             -- Which companion
conversion_type       -- 'click', 'session', 'page_view', 'booking', 'form_start', etc.

-- Attribution models
is_first_touch        -- First interaction (entered site via this post)
is_last_touch         -- Last interaction (booked after seeing this post)
time_to_conversion    -- Time from click to booking
```

**Automatic Tracking:**
When a user clicks a link from a social post with UTM parameters:

1. **Session created** with utm_source='instagram', utm_campaign='sydney_dec_weekend'
2. **Post identified** by matching UTM parameters
3. **Conversion recorded** automatically:
   - `click` conversion on initial visit
   - `session` conversion when page loads
   - `page_view`, `form_start` as user interacts
   - `booking` conversion when they book

**Example Query - See Full Journey:**

```sql
SELECT
  smp.post_url,
  smp.caption,
  smpc.conversion_type,
  smpc.is_first_touch,
  smpc.is_last_touch,
  smpc.created_at
FROM social_media_post_conversions smpc
JOIN social_media_posts smp ON smpc.post_id = smp.id
WHERE smpc.session_id = 'user-session-id'
ORDER BY smpc.created_at;

-- Shows: User saw Instagram post → clicked → browsed photos → submitted booking
```

### `social_media_metrics`

**Account-level daily metrics** (keeps existing functionality)

Daily snapshots of overall account performance.

---

## Analytical Views

### `v_social_post_performance`

**Individual post performance**

```sql
SELECT * FROM v_social_post_performance
WHERE tenant_id = 'claire-id'
ORDER BY conversion_rate_pct DESC
LIMIT 10;
```

**Returns:**

- Post details (platform, URL, date, caption)
- Engagement (likes, comments, views, engagement_rate)
- **Conversions** (clicks, sessions, bookings)
- **Attribution** (first_touch_sessions, last_touch_bookings)
- **Conversion rate %**
- **Cost per booking** (if promoted)
- **UTM tracking**

**Use Case:** "Which posts drove the most bookings?"

### `v_platform_performance`

**Platform comparison**

```sql
SELECT * FROM v_platform_performance
WHERE tenant_id = 'claire-id';
```

**Returns per platform:**

- Total posts (promoted vs organic)
- Engagement totals and averages
- Total sessions and bookings
- Conversion rate %
- Total ad spend
- Average cost per booking
- Last post date

**Use Case:** "Should I focus on Instagram or Twitter?"

### `v_top_posts`

**Best performing posts with scoring**

```sql
SELECT * FROM v_top_posts
WHERE tenant_id = 'claire-id'
LIMIT 20;
```

**Returns:**

- Post details with caption preview
- Engagement metrics
- Bookings and sessions generated
- **Performance score** (weighted: engagement 30%, sessions 30%, bookings 40%)

**Use Case:** "What content works best? Replicate it!"

---

## Helper Functions

### `track_social_post_conversion()`

**Automatically track conversions**

Called by backend when processing sessions/bookings:

```sql
-- User clicks link from Instagram post
SELECT track_social_post_conversion(
  'post-uuid',           -- Which post
  'session-uuid',        -- User's session
  NULL,                  -- No booking yet
  'session'              -- Conversion type
);

-- User submits booking
SELECT track_social_post_conversion(
  'post-uuid',
  'session-uuid',
  'booking-uuid',        -- Now has booking
  'booking'
);
```

**Automatically:**

- Marks first/last touch attribution
- Updates post's tracked_clicks, tracked_sessions, tracked_bookings
- Calculates time_to_conversion

### `get_post_performance()`

**Get performance for date range**

```sql
SELECT * FROM get_post_performance(
  'claire-id',
  '2025-12-01'::timestamp,
  '2025-12-31'::timestamp,
  'instagram'  -- Optional: filter by platform
);
```

Returns all posts with conversion metrics for the period.

### `get_top_hashtags()`

**Find best performing hashtags**

```sql
SELECT * FROM get_top_hashtags(
  'claire-id',
  90,  -- Last 90 days
  20   -- Top 20 hashtags
);
```

**Returns:**

- Hashtag
- Number of posts using it
- Average engagement rate
- Total bookings generated

**Use Case:** "Which hashtags drive bookings? Use them more!"

---

## Frontend Integration

### Admin Dashboard - Social Post Management

**Create Post Entry:**

```typescript
// When companion creates social post, log it
const createSocialPost = async (postData) => {
  const response = await fetch('/api/social-posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      platform: 'instagram',
      post_url: 'https://instagram.com/p/abc123',
      post_type: 'photo',
      caption: 'Available in Sydney!',
      hashtags: ['sydney', 'companion', 'gfe'],
      posted_at: new Date(),
      utm_source: 'instagram',
      utm_campaign: 'sydney_weekend',
      is_promoted: false,
    }),
  });
  return response.json();
};
```

**Update Engagement Metrics:**

```typescript
// Periodically sync engagement from platform APIs
const updatePostMetrics = async (postId) => {
  await fetch(`/api/social-posts/${postId}/metrics`, {
    method: 'PATCH',
    body: JSON.stringify({
      likes: 245,
      comments: 18,
      shares: 12,
      views: 3420,
      engagement_rate: 8.2,
    }),
  });
};
```

### UTM Link Generator

```typescript
const generateUTMLink = (baseUrl, post) => {
  const params = new URLSearchParams({
    utm_source: post.platform,
    utm_medium: 'social',
    utm_campaign: post.campaign_name,
    utm_content: post.id,
  });
  return `${baseUrl}?${params.toString()}`;
};

// Example:
// https://claire.companionconnect.app?utm_source=instagram&utm_medium=social&utm_campaign=sydney_weekend&utm_content=post-uuid
```

### Analytics Dashboard

**Post Performance Widget:**

```typescript
const PostPerformance = ({ tenantId }) => {
  const { data } = useQuery(['post-performance', tenantId], () =>
    fetch(`/api/tenants/${tenantId}/social-posts/performance`).then(r => r.json())
  );

  return (
    <div>
      <h3>Top Performing Posts</h3>
      {data?.map(post => (
        <div key={post.post_id}>
          <a href={post.post_url}>{post.platform} - {post.post_type}</a>
          <div>
            Engagement: {post.likes} likes, {post.comments} comments
          </div>
          <div>
            Conversions: {post.total_sessions} sessions → {post.total_bookings} bookings
            ({post.conversion_rate_pct}% conversion rate)
          </div>
          {post.is_promoted && (
            <div>Ad Spend: ${post.cost_per_booking}/booking</div>
          )}
        </div>
      ))}
    </div>
  );
};
```

**Platform Comparison:**

```typescript
const PlatformComparison = ({ tenantId }) => {
  const { data } = useQuery(['platform-performance', tenantId], () =>
    fetch(`/api/tenants/${tenantId}/platforms/performance`).then(r => r.json())
  );

  return (
    <table>
      <thead>
        <tr>
          <th>Platform</th>
          <th>Posts</th>
          <th>Engagement</th>
          <th>Sessions</th>
          <th>Bookings</th>
          <th>Conversion %</th>
          <th>Ad Spend</th>
          <th>Cost/Booking</th>
        </tr>
      </thead>
      <tbody>
        {data?.map(platform => (
          <tr key={platform.platform}>
            <td>{platform.platform}</td>
            <td>{platform.total_posts}</td>
            <td>{platform.avg_engagement_rate}%</td>
            <td>{platform.total_sessions}</td>
            <td>{platform.total_bookings}</td>
            <td>{platform.conversion_rate_pct}%</td>
            <td>${platform.total_ad_spend || 0}</td>
            <td>${platform.avg_cost_per_booking || 'N/A'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

---

## Automatic Conversion Attribution

### Backend Integration

**1. Session Creation (sessions API endpoint):**

```javascript
// When new session is created, check for social post UTM
app.post('/api/sessions', async (req, res) => {
  const session = await createSession(req.body);

  // Check if session came from social post
  if (session.utm_source && session.utm_campaign) {
    const post = await db.query(
      `
      SELECT id FROM social_media_posts 
      WHERE tenant_id = $1 
        AND utm_source = $2 
        AND utm_campaign = $3
    `,
      [session.tenant_id, session.utm_source, session.utm_campaign]
    );

    if (post.rows[0]) {
      // Track conversion
      await db.query(
        `
        SELECT track_social_post_conversion($1, $2, NULL, 'session')
      `,
        [post.rows[0].id, session.id]
      );
    }
  }

  res.json(session);
});
```

**2. Booking Submission:**

```javascript
app.post('/api/bookings', async (req, res) => {
  const booking = await createBooking(req.body);

  // Get session info
  const session = await getSession(booking.session_id);

  // Find related social post
  if (session.utm_source && session.utm_campaign) {
    const post = await db.query(
      `
      SELECT id FROM social_media_posts 
      WHERE tenant_id = $1 
        AND utm_source = $2 
        AND utm_campaign = $3
    `,
      [booking.tenant_id, session.utm_source, session.utm_campaign]
    );

    if (post.rows[0]) {
      // Track booking conversion
      await db.query(
        `
        SELECT track_social_post_conversion($1, $2, $3, 'booking')
      `,
        [post.rows[0].id, booking.session_id, booking.id]
      );
    }
  }

  res.json(booking);
});
```

---

## Analytics Examples

### Which posts drove bookings?

```sql
SELECT
  post_url,
  platform,
  LEFT(caption, 50) AS caption_preview,
  total_bookings,
  conversion_rate_pct
FROM v_social_post_performance
WHERE tenant_id = 'claire-id'
  AND total_bookings > 0
ORDER BY total_bookings DESC
LIMIT 10;
```

### Platform ROI analysis

```sql
SELECT
  platform,
  total_posts,
  total_bookings,
  total_ad_spend,
  avg_cost_per_booking,
  CASE
    WHEN avg_cost_per_booking IS NOT NULL
    THEN ROUND((800 - avg_cost_per_booking) / avg_cost_per_booking * 100, 2)  -- Assuming $800 avg booking value
    ELSE NULL
  END AS roi_percentage
FROM v_platform_performance
WHERE tenant_id = 'claire-id'
ORDER BY total_bookings DESC;
```

### Best time to post (by conversions)

```sql
SELECT
  EXTRACT(DOW FROM posted_at) AS day_of_week,
  EXTRACT(HOUR FROM posted_at) AS hour_of_day,
  COUNT(*) AS posts_count,
  AVG(tracked_bookings) AS avg_bookings_per_post
FROM social_media_posts
WHERE tenant_id = 'claire-id'
  AND posted_at >= NOW() - INTERVAL '90 days'
GROUP BY EXTRACT(DOW FROM posted_at), EXTRACT(HOUR FROM posted_at)
HAVING COUNT(*) >= 3  -- At least 3 posts
ORDER BY avg_bookings_per_post DESC;
```

### Content type performance

```sql
SELECT
  post_type,
  COUNT(*) AS total_posts,
  AVG(engagement_rate) AS avg_engagement,
  AVG(tracked_bookings) AS avg_bookings_per_post,
  SUM(tracked_bookings) AS total_bookings
FROM social_media_posts
WHERE tenant_id = 'claire-id'
  AND posted_at >= NOW() - INTERVAL '90 days'
GROUP BY post_type
ORDER BY avg_bookings_per_post DESC;
```

### Hashtag ROI

```sql
SELECT * FROM get_top_hashtags('claire-id', 90, 20);
-- Shows which hashtags correlate with bookings
```

---

## Summary

**What's Been Implemented:**

✅ **2 New Tables:**

- `social_media_posts` - Individual post tracking
- `social_media_post_conversions` - Attribution junction table

✅ **4 Analytical Views:**

- `v_social_post_performance` - Individual post metrics
- `v_platform_performance` - Platform comparison
- `v_top_posts` - Best performing content
- (Existing views also work with new data)

✅ **3 Helper Functions:**

- `track_social_post_conversion()` - Automatic attribution
- `get_post_performance()` - Query post metrics
- `get_top_hashtags()` - Find winning hashtags

✅ **Features:**

- **Post-level tracking** - Every Instagram post, tweet, etc.
- **Conversion attribution** - First touch, last touch, full journey
- **Platform comparison** - Instagram vs Twitter vs TikTok performance
- **UTM integration** - Automatic tracking via URL parameters
- **ROI tracking** - Cost per booking for paid promotions
- **Hashtag analysis** - Which hashtags drive bookings
- **Engagement metrics** - Likes, comments, shares, views
- **Time-to-conversion** - How long from click to booking

**Business Questions Answered:**

- Which social posts drive the most bookings?
- Which platform has the best ROI?
- Should I spend money promoting on Instagram or Twitter?
- What content types work best? (photos vs videos vs carousels)
- Which hashtags should I use?
- What time of day should I post?
- Is that viral tweet actually bringing in business?

**Ready to track every social post → booking conversion!** 🚀📱💰
