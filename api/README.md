# Companion Platform API

REST API for the multi-tenant companion booking platform.

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment:**
   Copy `.env` from root directory or create `api/.env`:

   ```env
   DB_HOST=companion-platform-db-do-user-28631775-0.j.db.ondigitalocean.com
   DB_PORT=25060
   DB_NAME=defaultdb
   DB_USER=doadmin
   DB_PASSWORD=your_password
   DB_SSL=require
   PORT=3001
   NODE_ENV=development
   ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
   ```

3. **Start server:**
   ```bash
   npm start
   ```

## API Endpoints

### Tenant API ✅ TESTED

#### Get Tenant by Subdomain

```http
GET /api/tenants/:subdomain
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "9daa3c12-bdec-4dc0-993d-7f9f8f391557",
    "subdomain": "claire",
    "name": "Claire Hamilton",
    "email": "info@clairehamilton.vip",
    "customDomain": "clairehamilton.vip",
    "status": "active",
    "themeConfig": {},
    "contentConfig": {
      "social_media": {
        "twitter": "https://x.com/ClaireSydney_"
      },
      "booking_enabled": true,
      "analytics_enabled": true,
      "ab_testing_enabled": true,
      "availability_enabled": true
    },
    "createdAt": "2025-11-06T21:21:04.651Z",
    "updatedAt": "2025-11-06T21:26:38.606Z"
  }
}
```

#### Get Tenant by Custom Domain

```http
GET /api/tenants/domain/:domain
```

**Example:**

```bash
curl http://localhost:3001/api/tenants/domain/clairehamilton.vip
```

**Response:** Same as subdomain endpoint

#### List All Tenants

```http
GET /api/tenants
```

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "9daa3c12-bdec-4dc0-993d-7f9f8f391557",
      "subdomain": "claire",
      "name": "Claire Hamilton",
      "email": "info@clairehamilton.vip",
      "customDomain": "clairehamilton.vip",
      "status": "active",
      "createdAt": "2025-11-06T21:21:04.651Z",
      "updatedAt": "2025-11-06T21:26:38.606Z"
    }
  ],
  "count": 1
}
```

### Availability API 🚧 TODO

#### Get Tenant Availability

```http
GET /api/availability/:tenantId
GET /api/availability/:tenantId?year=2025&month=11
```

#### Check Specific Date

```http
GET /api/availability/:tenantId/check?date=2025-11-15
```

#### Get Tenant Locations

```http
GET /api/locations/:tenantId
```

### Booking API 🚧 TODO

#### Create Booking

```http
POST /api/bookings
```

#### Get Booking Details

```http
GET /api/bookings/:bookingId
```

#### Update Booking Status

```http
PATCH /api/bookings/:bookingId/status
```

### Payment API 🚧 TODO

#### Record Payment

```http
POST /api/payments
```

#### Get Booking Payments

```http
GET /api/payments/booking/:bookingId
```

#### Process Refund

```http
POST /api/payments/:paymentId/refund
```

### Analytics API 🚧 TODO

#### Register Session

```http
POST /api/analytics/session
```

#### Track Event

```http
POST /api/analytics/event
```

#### Get Analytics

```http
GET /api/analytics/tenant/:tenantId
```

## Testing

**Manual testing with PowerShell:**

```powershell
# Start server
cd api
node server.js

# Test endpoints (in separate terminal)
Invoke-RestMethod -Uri "http://localhost:3001/api/tenants/claire" -Method Get | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "http://localhost:3001/api/tenants/domain/clairehamilton.vip" -Method Get | ConvertTo-Json -Depth 10
Invoke-RestMethod -Uri "http://localhost:3001/api/tenants" -Method Get | ConvertTo-Json -Depth 10
```

**Using test script:**

```bash
node test-tenant.js
```

## Database

- **Provider:** DigitalOcean Managed PostgreSQL 16
- **Connection:** Configured via environment variables
- **Pool:** 20 max connections, 30s idle timeout
- **SSL:** Required

## Development Status

- ✅ **Tenant API** - Complete and tested (3 endpoints)
- 🚧 **Availability API** - Next to implement
- 🚧 **Booking API** - Pending
- 🚧 **Payment API** - Pending
- 🚧 **Analytics API** - Pending

## Error Handling

All endpoints return consistent error responses:

```json
{
  "error": "Error Type",
  "message": "Detailed error message"
}
```

**Status codes:**

- `200` - Success
- `400` - Bad Request (validation error)
- `404` - Not Found
- `500` - Internal Server Error
