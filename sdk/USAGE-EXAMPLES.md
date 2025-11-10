# Modular SDK Usage Examples

This guide shows how to use the refactored modular SDK with its plugin architecture, middleware system, and swappable adapters.

## 📚 Table of Contents

- [Quick Start](#quick-start)
- [Plugin-Based Setup](#plugin-based-setup)
- [Direct DataSource Usage](#direct-datasource-usage)
- [Middleware Examples](#middleware-examples)
- [Custom Adapters](#custom-adapters)
- [Migration from Old SDK](#migration-from-old-sdk)

## Quick Start

### Traditional Way (Backward Compatible)

The SDK is fully backward compatible with existing code:

```typescript
import { ApiClient, BookingDataSource, TenantDataSource } from '@osullivanfarms/sdk';

// Create client
const client = new ApiClient('https://api.example.com');

// Create datasources (instance-based now)
const bookings = new BookingDataSource(client);
const tenants = new TenantDataSource(client);

// Use them
const allBookings = await bookings.getAll();
const tenant = await tenants.getBySubdomain('acme');
```

### Plugin Way (Recommended)

Use the new plugin-based SDK for better organization:

```typescript
import { createSDK, BookingPlugin, TenantPlugin } from '@osullivanfarms/sdk';

// Create SDK with plugins
const sdk = createSDK({ baseURL: 'https://api.example.com' }).use(BookingPlugin).use(TenantPlugin);

// Get services
const bookings = sdk.get('bookings');
const tenants = sdk.get('tenants');

// Use them
const allBookings = await bookings.getAll();
const tenant = await tenants.getBySubdomain('acme');
```

## Plugin-Based Setup

### Basic Plugin Configuration

```typescript
import {
  createSDK,
  BookingPlugin,
  TenantPlugin,
  authMiddleware,
  loggingMiddleware,
} from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [loggingMiddleware(), authMiddleware('your-token')],
})
  .use(BookingPlugin)
  .use(TenantPlugin);

// List available services
console.log(sdk.getServices()); // ['bookings', 'tenants']
```

### Custom Plugin

Create your own plugin for any domain:

```typescript
import { Plugin, ApiClient } from '@osullivanfarms/sdk';
import { BaseDataSource } from '@osullivanfarms/sdk/core';

// Define your resource type
interface Product {
  id: number;
  name: string;
  price: number;
}

// Create datasource
class ProductDataSource extends BaseDataSource<Product> {
  protected endpoint = '/products';

  // Add domain-specific methods
  async getByCategory(category: string): Promise<Product[]> {
    return this.getAll({ category });
  }

  async updatePrice(id: string | number, price: number): Promise<Product> {
    return this.patch(id, { price });
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

// Use it
const sdk = createSDK({ baseURL: 'https://api.example.com' }).use(ProductPlugin);

const products = sdk.get('products');
await products.getByCategory('electronics');
```

## Direct DataSource Usage

You can use datasources directly without plugins:

```typescript
import { ApiClient, BaseDataSource } from '@osullivanfarms/sdk';

// Create client
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  headers: {
    Authorization: 'Bearer token',
  },
});

// Use built-in datasources
import { BookingDataSource } from '@osullivanfarms/sdk';
const bookings = new BookingDataSource(client);

// Or create custom datasource inline
class UserDataSource extends BaseDataSource<User> {
  protected endpoint = '/users';
}

const users = new UserDataSource(client);
const allUsers = await users.getAll();
```

## Middleware Examples

### Authentication

```typescript
import { createSDK, authMiddleware, apiKeyMiddleware } from '@osullivanfarms/sdk';

// Bearer token
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [authMiddleware('static-token')],
});

// Dynamic token
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [authMiddleware(() => localStorage.getItem('token'))],
});

// Async token
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [
    authMiddleware(async () => {
      const session = await getSession();
      return session.accessToken;
    }),
  ],
});

// API key
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [apiKeyMiddleware('your-api-key')],
});
```

### Retry Logic

```typescript
import { createSDK, retryMiddleware } from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [
    retryMiddleware({
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      onRetry: (attempt, error) => {
        console.log(`Retry ${attempt}:`, error.message);
      },
    }),
  ],
});
```

### Logging

```typescript
import { createSDK, loggingMiddleware } from '@osullivanfarms/sdk';

// Default logging
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [loggingMiddleware()],
});

// Custom logger
const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [
    loggingMiddleware({
      logger: {
        log: (...args) => myLogger.info(...args),
        error: (...args) => myLogger.error(...args),
        warn: (...args) => myLogger.warn(...args),
        info: (...args) => myLogger.info(...args),
        debug: (...args) => myLogger.debug(...args),
      },
      logHeaders: true,
      logTiming: true,
    }),
  ],
});
```

### Combining Middleware

```typescript
import { createSDK, loggingMiddleware, authMiddleware, retryMiddleware } from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.example.com',
  middleware: [
    loggingMiddleware(), // Log everything
    authMiddleware(() => getToken()), // Add auth
    retryMiddleware(), // Retry with auth
  ],
});
```

## Custom Adapters

### Axios Adapter

```typescript
import axios, { AxiosInstance } from 'axios';
import { IHttpAdapter, RequestConfig } from '@osullivanfarms/sdk';

export class AxiosAdapter implements IHttpAdapter {
  private axiosInstance: AxiosInstance;

  constructor(config?: AxiosRequestConfig) {
    this.axiosInstance = axios.create(config);
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.get<T>(url, {
      headers: config?.headers,
      params: config?.params,
      timeout: config?.timeout,
      signal: config?.signal,
    });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.axiosInstance.post<T>(url, data, {
      headers: config?.headers,
      params: config?.params,
      timeout: config?.timeout,
      signal: config?.signal,
    });
    return response.data;
  }

  // ... implement put, patch, delete
}

// Use it
import { createSDK } from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.example.com',
  adapter: new AxiosAdapter(),
});
```

### React Query Integration

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createSDK, BookingPlugin } from '@osullivanfarms/sdk';

const sdk = createSDK({ baseURL: '/api' }).use(BookingPlugin);
const bookings = sdk.get('bookings');

function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => bookings.getAll()
  });
}

function useCreateBooking() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data) => bookings.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    }
  });
}

// Use in component
function BookingList() {
  const { data, isLoading } = useBookings();
  const createBooking = useCreateBooking();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      {data?.map(booking => (
        <div key={booking.id}>{booking.name}</div>
      ))}
      <button onClick={() => createBooking.mutate({ name: 'Test' })}>
        Create Booking
      </button>
    </div>
  );
}
```

## Migration from Old SDK

### Old Code (Static Methods)

```typescript
import { BookingDataSource } from '@osullivanfarms/sdk';

// Old way - static methods with hardcoded URL
const bookings = await BookingDataSource.getAll();
const booking = await BookingDataSource.getById('123');
```

### New Code (Instance Methods)

```typescript
import { ApiClient, BookingDataSource } from '@osullivanfarms/sdk';

// New way - instance with injectable client
const client = new ApiClient('https://api.example.com');
const bookings = new BookingDataSource(client);

const allBookings = await bookings.getAll();
const booking = await bookings.getById('123');
```

### Or with Plugins

```typescript
import { createSDK, BookingPlugin } from '@osullivanfarms/sdk';

const sdk = createSDK({ baseURL: 'https://api.example.com' }).use(BookingPlugin);

const bookings = sdk.get('bookings');
const allBookings = await bookings.getAll();
```

## Complete Examples

### E-Commerce App

```typescript
import { createSDK, BaseDataSource, Plugin } from '@osullivanfarms/sdk';
import { authMiddleware, retryMiddleware } from '@osullivanfarms/sdk/middleware';

// Define types
interface Product {
  id: number;
  name: string;
  price: number;
}

interface Order {
  id: number;
  userId: number;
  items: OrderItem[];
  total: number;
}

// Create datasources
class ProductDataSource extends BaseDataSource<Product> {
  protected endpoint = '/products';

  async search(query: string): Promise<Product[]> {
    return this.getAll({ q: query });
  }
}

class OrderDataSource extends BaseDataSource<Order> {
  protected endpoint = '/orders';

  async getByUser(userId: number): Promise<Order[]> {
    return this.getAll({ userId });
  }
}

// Create plugin
const ECommercePlugin: Plugin = {
  name: 'ecommerce',
  version: '1.0.0',
  initialize(client) {
    return {
      products: new ProductDataSource(client),
      orders: new OrderDataSource(client),
    };
  },
};

// Setup SDK
const sdk = createSDK({
  baseURL: 'https://api.mystore.com',
  middleware: [authMiddleware(() => getAuthToken()), retryMiddleware({ maxAttempts: 3 })],
}).use(ECommercePlugin);

// Use it
const products = sdk.get('products');
const orders = sdk.get('orders');

const searchResults = await products.search('laptop');
const userOrders = await orders.getByUser(123);
```

### Multi-Tenant SaaS

```typescript
import { createSDK, TenantPlugin, authMiddleware } from '@osullivanfarms/sdk';

const sdk = createSDK({
  baseURL: 'https://api.myapp.com',
  middleware: [
    authMiddleware(() => localStorage.getItem('token')),
    // Add tenant header
    async (context, next) => {
      const tenant = await getTenantFromHost();
      context.headers['X-Tenant-ID'] = tenant.id;
      return next();
    },
  ],
}).use(TenantPlugin);

const tenants = sdk.get('tenants');
const currentTenant = await tenants.getCurrent();
```

## Next Steps

- [Middleware Guide](./MIDDLEWARE-GUIDE.md) - Deep dive into middleware
- [Implementation Guide](./IMPLEMENTATION-GUIDE.md) - Architecture overview
- [Core Interfaces](./src/core/interfaces.ts) - TypeScript interfaces
- [Base DataSource](./src/core/BaseDataSource.ts) - Extend for any resource
