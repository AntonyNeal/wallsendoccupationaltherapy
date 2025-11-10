# Service Booking Platform SDK

**Modular, plugin-based TypeScript/JavaScript SDK** for building service booking platforms and beyond. Designed like Lego blocks - composable, reusable, and framework-agnostic.

## ✨ What's New in v2.0

🎉 **Completely Refactored Architecture!**

The SDK has been redesigned from the ground up with modularity and reusability in mind:

- 🧩 **Plugin Architecture** - Use only what you need
- 🔌 **Dependency Injection** - Testable, configurable components
- 🎯 **Middleware System** - Auth, retry, logging, and custom interceptors
- 🔄 **Swappable Adapters** - Use Fetch, Axios, or build your own
- 🏗️ **Generic Base Classes** - Reuse for ANY domain (not just bookings)
- 🌳 **Tree-Shakeable** - Smaller bundles, faster apps
- ✅ **100% Backward Compatible** - Migrate at your own pace

## 📦 What's Included

This SDK provides:

1. **Modular JavaScript/TypeScript Client** - Plugin-based, type-safe API access
2. **Middleware System** - Auth, retry, logging, and custom interceptors
3. **HTTP Adapters** - Fetch (default), or bring your own (Axios, etc.)
4. **Base Classes** - Generic CRUD operations for any resource type
5. **Deployment Templates** - Vercel, DigitalOcean, Netlify configs
6. **Code Generators** - Scaffold components and pages
7. **Infrastructure Guides** - Production deployment best practices

---

## Installation

### NPM (recommended)

```bash
npm install @osullivanfarms/sdk
```

### CDN

```html
<script type="module" src="https://unpkg.com/@osullivanfarms/sdk/dist/index.mjs"></script>
```

## Quick Start

### Simple Setup (Backward Compatible)

```typescript
import { ApiClient, BookingDataSource } from '@osullivanfarms/sdk';

// Create client
const client = new ApiClient('https://api.example.com');

// Create datasource
const bookings = new BookingDataSource(client);

// Use it
const allBookings = await bookings.getAll();
const booking = await bookings.getById('123');
```

### Plugin-Based Setup (Recommended)

```typescript
import { createSDK, BookingPlugin, TenantPlugin } from '@osullivanfarms/sdk';
import { authMiddleware, retryMiddleware } from '@osullivanfarms/sdk/middleware';

// Create SDK with plugins and middleware
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [
    authMiddleware(() => localStorage.getItem('token')),
    retryMiddleware({ maxAttempts: 3 }),
  ],
})
  .use(BookingPlugin)
  .use(TenantPlugin);

// Get services
const bookings = sdk.get('bookings');
const tenants = sdk.get('tenants');

// Use them
const allBookings = await bookings.getAll();
const currentTenant = await tenants.getCurrent();
```

### With Middleware

```typescript
import { ApiClient } from '@osullivanfarms/sdk';
import { authMiddleware, retryMiddleware, loggingMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [
    loggingMiddleware(), // Log all requests
    authMiddleware(() => getToken()), // Add auth automatically
    retryMiddleware({ maxAttempts: 3 }), // Retry failed requests
  ],
});
```

## Configuration

```typescript
import { createSDK } from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.example.com', // Required: API base URL
  adapter: customAdapter, // Optional: HTTP adapter (default: FetchAdapter)
  timeout: 10000, // Optional: Request timeout (ms)
  headers: {
    // Optional: Default headers
    'X-App-Version': '2.0.0',
  },
  middleware: [
    // Optional: Middleware chain
    authMiddleware(() => getToken()),
    retryMiddleware(),
    loggingMiddleware(),
  ],
});
```

const sdk = new ServiceBookingSDK(config);

````

## API Reference

### Tenant Management

#### `sdk.tenant.getConfig()`
Get tenant configuration including business info, branding, and services.

```javascript
const config = await sdk.tenant.getConfig();
// Returns: TenantConfig object
````

#### `sdk.tenant.getServices()`

Get list of available services for the tenant.

```javascript
const services = await sdk.tenant.getServices();
// Returns: Service[] array
```

#### `sdk.tenant.getAvailability(options)`

Check availability for a specific service and date.

```javascript
const availability = await sdk.tenant.getAvailability({
  serviceId: 'service-1',
  date: '2024-01-15',
  timezone: 'America/New_York',
});
// Returns: Availability object with available slots
```

### Booking Management

#### `sdk.bookings.create(data)`

Create a new booking.

```javascript
const booking = await sdk.bookings.create({
  serviceId: 'service-1',
  datetime: '2024-01-15T10:00:00Z',
  duration: 60,
  customerInfo: {
    name: 'Customer Name',
    email: 'customer@example.com',
    phone: '+1234567890',
  },
  notes: 'Special requests',
  location: {
    type: 'business', // or "customer", "remote"
    address: '123 Main St',
  },
});
// Returns: Booking object
```

#### `sdk.bookings.get(bookingId)`

Get booking details by ID.

```javascript
const booking = await sdk.bookings.get('booking-123');
// Returns: Booking object
```

#### `sdk.bookings.update(bookingId, updates)`

Update an existing booking.

```javascript
const updated = await sdk.bookings.update('booking-123', {
  datetime: '2024-01-16T14:00:00Z',
  notes: 'Updated notes',
});
// Returns: Updated Booking object
```

#### `sdk.bookings.cancel(bookingId, reason?)`

Cancel a booking.

```javascript
const cancelled = await sdk.bookings.cancel('booking-123', 'Customer requested');
// Returns: Cancelled Booking object
```

### Analytics

#### `sdk.analytics.getStats(options)`

Get booking statistics for a date range.

```javascript
const stats = await sdk.analytics.getStats({
  startDate: '2024-01-01',
  endDate: '2024-01-31',
  groupBy: 'day', // or "week", "month"
});
// Returns: Analytics stats object
```

#### `sdk.analytics.getRevenue(options)`

Get revenue data for a specific period.

```javascript
const revenue = await sdk.analytics.getRevenue({
  period: 'month',
  year: 2024,
  month: 1,
});
// Returns: Revenue data object
```

## TypeScript Support

The SDK includes full TypeScript definitions. Import types as needed:

```typescript
import {
  ServiceBookingSDK,
  TenantConfig,
  Service,
  Booking,
  BookingData,
  SDKConfig,
} from '@your-organization/service-booking-sdk';

const sdk: ServiceBookingSDK = new ServiceBookingSDK({
  apiUrl: 'https://your-api-domain.com/api',
  tenantId: 'demo',
});

const booking: Booking = await sdk.bookings.create({
  serviceId: 'service-1',
  datetime: '2024-01-15T10:00:00Z',
  customerInfo: {
    name: 'John Doe',
    email: 'john@example.com',
  },
} as BookingData);
```

## Error Handling

The SDK throws typed errors for different scenarios:

```javascript
import { ServiceBookingSDK, SDKError } from '@your-organization/service-booking-sdk';

try {
  const booking = await sdk.bookings.create(bookingData);
} catch (error) {
  if (error instanceof SDKError) {
    switch (error.type) {
      case 'VALIDATION_ERROR':
        console.log('Invalid data:', error.details);
        break;
      case 'NETWORK_ERROR':
        console.log('Connection failed:', error.message);
        break;
      case 'API_ERROR':
        console.log('Server error:', error.status, error.message);
        break;
      case 'TIMEOUT_ERROR':
        console.log('Request timed out');
        break;
      default:
        console.log('Unknown error:', error);
    }
  }
}
```

## Development

### Building

```bash
npm run build
```

### Testing

```bash
npm test
```

### Development Mode

```bash
npm run dev
```

---

## 🚀 Deployment Templates

This SDK includes production-ready deployment configurations for multiple cloud platforms.

### Quick Deploy Setup

```powershell
# Copy Vercel templates to your project
Copy-Item sdk/deployment-templates/vercel-config.json vercel.json
Copy-Item sdk/deployment-templates/vercel.ignore .vercelignore
Copy-Item sdk/deployment-templates/vercel-api-adapter.js api/index.js

# Deploy
vercel --prod
```

### Available Platforms

| Platform         | Best For                     | Setup Time |
| ---------------- | ---------------------------- | ---------- |
| **Vercel**       | Serverless, global edge      | 5 min      |
| **DigitalOcean** | Traditional apps, managed DB | 10 min     |
| **Netlify**      | JAMstack, static sites       | 5 min      |

### Full Documentation

- **Template Library:** [deployment-templates/INDEX.md](./deployment-templates/INDEX.md)
- **Platform Guides:** See individual README files in `deployment-templates/`
- **Vercel Guide:** [deployment-templates/VERCEL-KIT-README.md](./deployment-templates/VERCEL-KIT-README.md)

---

## 📖 Documentation

### Getting Started

- 📘 [Usage Examples](./USAGE-EXAMPLES.md) - Complete usage patterns
- 🔄 [Migration Guide](./MIGRATION-GUIDE.md) - Upgrade from v1.x
- 🚀 [Quick Reference](./QUICK_REFERENCE.md) - API reference

### Architecture

- 🏗️ [Implementation Guide](./IMPLEMENTATION-GUIDE.md) - Architecture overview
- 🧩 [Modular Architecture](./MODULAR-ARCHITECTURE-PROPOSAL.md) - Design principles
- 🎯 [Core Interfaces](./src/core/interfaces.ts) - TypeScript interfaces

### Features

- 🎛️ [Middleware Guide](./MIDDLEWARE-GUIDE.md) - Auth, retry, logging
- 🔌 [Generators Guide](./GENERATORS-GUIDE.md) - Code generation
- 🌐 [Infrastructure Guide](./INFRASTRUCTURE-GUIDE.md) - Cloud deployment

### Deployment

- ☁️ [Deployment Templates](./deployment-templates/INDEX.md) - Multi-cloud configs
- 📦 [SDK Integration](./SDK-INTEGRATION.md) - Integration patterns

---

## 🎨 Creating Custom Plugins

The SDK is designed to be reused for **any domain**, not just bookings:

```typescript
import { Plugin, BaseDataSource, ApiClient } from '@osullivanfarms/sdk';

// Your domain types
interface Product {
  id: number;
  name: string;
  price: number;
}

// Create datasource (inherits CRUD operations)
class ProductDataSource extends BaseDataSource<Product> {
  protected endpoint = '/products';

  // Add domain-specific methods
  async getByCategory(category: string): Promise<Product[]> {
    return this.getAll({ category });
  }
}

// Create plugin
export const ProductPlugin: Plugin = {
  name: 'products',
  version: '1.0.0',
  initialize(client: unknown): Record<string, unknown> {
    return {
      products: new ProductDataSource(client as ApiClient),
    };
  },
};

// Use anywhere!
const sdk = createSDK({ baseURL: 'https://api.mystore.com' }).use(ProductPlugin);

const products = sdk.get('products');
const electronics = await products.getByCategory('electronics');
```

---

## Browser Support

- Chrome 88+
- Firefox 85+
- Safari 14+
- Edge 88+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

For issues and questions:

- GitHub Issues: [Create an issue](https://github.com/your-username/service-booking-platform-template/issues)
- 📘 [Usage Examples](./USAGE-EXAMPLES.md)
- 🔄 [Migration Guide](./MIGRATION-GUIDE.md)
- 🏗️ [Architecture Docs](./IMPLEMENTATION-GUIDE.md)

---

## SDK Directory Structure

```
sdk/
 README.md (this file)           # Main SDK documentation
 package.json                     # NPM package configuration
 src/                            # SDK source code
 dist/                           # Built SDK (after npm run build)

 deployment-templates/           #  Deployment configurations (common library)
    INDEX.md                   # Templates library overview
    README.md                  # Platform comparison & quick start
    VERCEL-KIT-README.md       # Complete Vercel setup guide
    vercel-config.json         # Vercel configuration template
    vercel.ignore              # Vercel ignore rules template
    vercel-api-adapter.js      # Vercel API adapter template
    vercel-guide.md            # Step-by-step Vercel deployment
    app-spec-digitalocean.yaml # DigitalOcean app specification
    netlify-template.toml      # Netlify configuration

 scripts/                        # Helper scripts
    install-deployment.js      # Automated template installer

 DEPLOYMENT-TEMPLATES-GUIDE.md   # How to use deployment templates
 GENERATORS-GUIDE.md             # Code generation patterns
 INFRASTRUCTURE-GUIDE.md         # Infrastructure best practices
```

**Usage:** Copy deployment templates from `deployment-templates/` to new projects, or use `npm run setup:vercel` (and similar scripts).
