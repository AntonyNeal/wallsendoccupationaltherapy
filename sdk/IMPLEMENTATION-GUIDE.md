# Quick Implementation Guide: Making SDK Modular

> **🎯 Actionable steps to transform your SDK into a Lego kit**

---

## Step 1: Add Core Interfaces (1-2 hours)

Create `sdk/src/core/interfaces.ts`:

```typescript
// ============================================================================
// HTTP ADAPTER INTERFACE
// ============================================================================
export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface IHttpAdapter {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
  patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
}

// ============================================================================
// DATA SOURCE INTERFACE
// ============================================================================
export interface IResource {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

export interface QueryParams {
  limit?: number;
  offset?: number;
  sort?: string;
  filter?: Record<string, any>;
}

export interface IDataSource<T extends IResource> {
  getAll(params?: QueryParams): Promise<T[]>;
  getById(id: string | number): Promise<T>;
  create(data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T>;
  update(id: string | number, data: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
}

// ============================================================================
// MIDDLEWARE INTERFACE
// ============================================================================
export type MiddlewareContext = {
  request: Request;
  config: RequestConfig;
};

export type MiddlewareNext = () => Promise<Response>;

export type Middleware = (context: MiddlewareContext, next: MiddlewareNext) => Promise<Response>;

// ============================================================================
// PLUGIN INTERFACE
// ============================================================================
export interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  install(sdk: any): void | Promise<void>;
}

// ============================================================================
// SDK CONFIG
// ============================================================================
export interface SDKConfig {
  baseURL: string;
  adapter?: IHttpAdapter;
  timeout?: number;
  headers?: Record<string, string>;
  middleware?: Middleware[];
}
```

**Implementation time:** 30 minutes  
**Breaking changes:** None  
**Next files can use these interfaces**

---

## Step 2: Create Generic HTTP Adapters (2-3 hours)

Create `sdk/src/core/adapters/FetchAdapter.ts`:

```typescript
import { IHttpAdapter, RequestConfig } from '../interfaces';

export class FetchAdapter implements IHttpAdapter {
  constructor(private defaultConfig?: RequestConfig) {}

  private buildRequest(
    url: string,
    method: string,
    data?: unknown,
    config?: RequestConfig
  ): Request {
    const headers = new Headers({
      'Content-Type': 'application/json',
      ...this.defaultConfig?.headers,
      ...config?.headers,
    });

    const body = data ? JSON.stringify(data) : undefined;

    return new Request(url, {
      method,
      headers,
      body,
      signal: config?.signal,
    });
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'GET', undefined, config);
    const response = await fetch(request);
    return response.json();
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'POST', data, config);
    const response = await fetch(request);
    return response.json();
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'PUT', data, config);
    const response = await fetch(request);
    return response.json();
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'DELETE', undefined, config);
    const response = await fetch(request);
    return response.json();
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'PATCH', data, config);
    const response = await fetch(request);
    return response.json();
  }
}
```

Create `sdk/src/core/adapters/AxiosAdapter.ts`:

```typescript
import axios, { AxiosInstance } from 'axios';
import { IHttpAdapter, RequestConfig } from '../interfaces';

export class AxiosAdapter implements IHttpAdapter {
  private axios: AxiosInstance;

  constructor(config?: RequestConfig) {
    this.axios = axios.create({
      headers: config?.headers,
      timeout: config?.timeout,
    });
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const response = await this.axios.get(url, {
      params: config?.params,
      headers: config?.headers,
      signal: config?.signal,
    });
    return response.data;
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const response = await this.axios.post(url, data, {
      params: config?.params,
      headers: config?.headers,
      signal: config?.signal,
    });
    return response.data;
  }

  // ... similar for put, delete, patch
}
```

**Test both adapters work identically**

---

## Step 3: Refactor ApiClient to Use Adapter (1 hour)

Update `sdk/src/client.ts`:

```typescript
import { IHttpAdapter, RequestConfig, SDKConfig, Middleware } from './core/interfaces';
import { FetchAdapter } from './core/adapters/FetchAdapter';

export class ApiClient {
  private adapter: IHttpAdapter;
  private middleware: Middleware[] = [];
  private baseURL: string;

  constructor(config: SDKConfig) {
    this.baseURL = config.baseURL;
    this.adapter = config.adapter || new FetchAdapter();
    this.middleware = config.middleware || [];
  }

  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  private buildURL(endpoint: string, params?: Record<string, string | number>): string {
    const url = new URL(endpoint, this.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }
    return url.toString();
  }

  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    return this.adapter.get<T>(url, config);
  }

  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    return this.adapter.post<T>(url, data, config);
  }

  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    return this.adapter.put<T>(url, data, config);
  }

  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint);
    return this.adapter.delete<T>(url, config);
  }
}
```

**Backward compatibility:** Provide default adapter  
**Test:** All existing code should still work

---

## Step 4: Create Generic BaseDataSource (2 hours)

Create `sdk/src/core/BaseDataSource.ts`:

```typescript
import { ApiClient } from '../client';
import { IDataSource, IResource, QueryParams } from './interfaces';

export abstract class BaseDataSource<T extends IResource> implements IDataSource<T> {
  protected abstract endpoint: string;

  constructor(protected client: ApiClient) {}

  async getAll(params?: QueryParams): Promise<T[]> {
    const response = await this.client.get<{ data: T[] }>(this.endpoint, { params });
    return response.data;
  }

  async getById(id: string | number): Promise<T> {
    const response = await this.client.get<{ data: T }>(`${this.endpoint}/${id}`);
    return response.data;
  }

  async create(data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    const response = await this.client.post<{ data: T }>(this.endpoint, data);
    return response.data;
  }

  async update(id: string | number, data: Partial<T>): Promise<T> {
    const response = await this.client.put<{ data: T }>(`${this.endpoint}/${id}`, data);
    return response.data;
  }

  async delete(id: string | number): Promise<void> {
    await this.client.delete(`${this.endpoint}/${id}`);
  }
}
```

---

## Step 5: Refactor Existing DataSources (3-4 hours)

Update `sdk/src/datasources/booking.ts`:

```typescript
import { BaseDataSource } from '../core/BaseDataSource';
import { Booking } from '../types';
import { ApiClient } from '../client';

// Make Booking extend IResource if it doesn't already
export interface Booking {
  id: string;
  tenantId: string;
  clientName: string;
  clientEmail: string;
  // ... other fields
  createdAt: string;
  updatedAt: string;
}

export class BookingDataSource extends BaseDataSource<Booking> {
  protected endpoint = '/bookings';

  // Inherits: getAll, getById, create, update, delete

  // Add booking-specific methods
  async confirm(id: string): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(`${this.endpoint}/${id}/confirm`);
    return response.data;
  }

  async cancel(id: string, reason?: string): Promise<Booking> {
    const response = await this.client.post<{ data: Booking }>(`${this.endpoint}/${id}/cancel`, {
      reason,
    });
    return response.data;
  }

  async getByTenant(tenantId: string): Promise<Booking[]> {
    return this.getAll({ filter: { tenantId } });
  }
}
```

**Do this for all datasources:**

- TenantDataSource
- AvailabilityDataSource
- LocationDataSource
- PaymentDataSource
- etc.

---

## Step 6: Add Middleware System (2-3 hours)

Create `sdk/src/core/middleware/auth.ts`:

```typescript
import { Middleware } from '../interfaces';

export const authMiddleware = (token: string | (() => string)): Middleware => {
  return async (context, next) => {
    const authToken = typeof token === 'function' ? token() : token;
    context.request.headers.set('Authorization', `Bearer ${authToken}`);
    return next();
  };
};
```

Create `sdk/src/core/middleware/retry.ts`:

```typescript
import { Middleware } from '../interfaces';

export const retryMiddleware = (maxAttempts: number = 3, delayMs: number = 1000): Middleware => {
  return async (context, next) => {
    let lastError: Error;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        return await next();
      } catch (error) {
        lastError = error as Error;
        if (attempt < maxAttempts - 1) {
          await new Promise((resolve) => setTimeout(resolve, delayMs * (attempt + 1)));
        }
      }
    }

    throw lastError!;
  };
};
```

Create `sdk/src/core/middleware/logging.ts`:

```typescript
import { Middleware } from '../interfaces';

export const loggingMiddleware = (logger?: Console): Middleware => {
  const log = logger || console;

  return async (context, next) => {
    const start = Date.now();
    log.log(`[SDK] ${context.request.method} ${context.request.url}`);

    try {
      const response = await next();
      const duration = Date.now() - start;
      log.log(`[SDK] ${response.status} in ${duration}ms`);
      return response;
    } catch (error) {
      const duration = Date.now() - start;
      log.error(`[SDK] Error after ${duration}ms:`, error);
      throw error;
    }
  };
};
```

---

## Step 7: Create Plugin System (3-4 hours)

Create `sdk/src/core/SDK.ts`:

```typescript
import { Plugin, SDKConfig } from './interfaces';
import { ApiClient } from '../client';

export class SDK {
  private plugins: Map<string, Plugin> = new Map();
  private services: Map<string, any> = new Map();
  public client: ApiClient;

  constructor(private config: SDKConfig) {
    this.client = new ApiClient(config);
  }

  use(plugin: Plugin): this {
    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin ${plugin.name} requires ${dep}`);
        }
      }
    }

    // Install plugin
    plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  register(name: string, service: any): void {
    this.services.set(name, service);
  }

  get<T>(name: string): T {
    const service = this.services.get(name);
    if (!service) {
      throw new Error(`Service ${name} not found. Did you forget to use the plugin?`);
    }
    return service as T;
  }

  has(name: string): boolean {
    return this.services.has(name);
  }
}
```

Create `sdk/src/plugins/booking.plugin.ts`:

```typescript
import { Plugin } from '../core/interfaces';
import { SDK } from '../core/SDK';
import { BookingDataSource } from '../datasources/booking';
import { AvailabilityDataSource } from '../datasources/availability';

export const BookingPlugin: Plugin = {
  name: 'booking',
  version: '1.0.0',

  install(sdk: SDK) {
    // Register datasources
    sdk.register('bookings', new BookingDataSource(sdk.client));
    sdk.register('availability', new AvailabilityDataSource(sdk.client));
  },
};
```

---

## Step 8: Update Exports (1 hour)

Update `sdk/src/index.ts`:

```typescript
// ============================================================================
// CORE
// ============================================================================
export { SDK } from './core/SDK';
export { ApiClient } from './client';
export { BaseDataSource } from './core/BaseDataSource';

// Core interfaces
export type {
  IHttpAdapter,
  IDataSource,
  IResource,
  Plugin,
  SDKConfig,
  RequestConfig,
  QueryParams,
  Middleware,
} from './core/interfaces';

// Adapters
export { FetchAdapter } from './core/adapters/FetchAdapter';
export { AxiosAdapter } from './core/adapters/AxiosAdapter';

// Middleware
export { authMiddleware } from './core/middleware/auth';
export { retryMiddleware } from './core/middleware/retry';
export { loggingMiddleware } from './core/middleware/logging';

// ============================================================================
// PLUGINS (Optional - only if user wants them)
// ============================================================================
export { BookingPlugin } from './plugins/booking.plugin';
export { PaymentPlugin } from './plugins/payment.plugin';
export { AnalyticsPlugin } from './plugins/analytics.plugin';

// ============================================================================
// DATASOURCES (Can be used directly too)
// ============================================================================
export { BookingDataSource } from './datasources/booking';
export { TenantDataSource } from './datasources/tenant';
export { PaymentDataSource } from './datasources/payment';
// ... etc

// ============================================================================
// TYPES
// ============================================================================
export type * from './types';

// ============================================================================
// GENERATORS (Keep as-is, optional)
// ============================================================================
export * from './generators/theme';
export * from './generators/app';
export * from './generators/seo';
export * from './generators/assets';
```

---

## Step 9: Update Documentation & Examples (2 hours)

Update README with new usage patterns:

````markdown
## Usage

### Option 1: Minimal (Core Only)

```typescript
import { SDK, FetchAdapter } from '@your-org/sdk';

const sdk = new SDK({
  baseURL: 'https://api.example.com',
  adapter: new FetchAdapter(),
});

// Use base functionality
const response = await sdk.client.get('/endpoint');
```
````

### Option 2: With Plugins (Recommended)

```typescript
import { SDK } from '@your-org/sdk';
import { BookingPlugin, PaymentPlugin } from '@your-org/sdk';

const sdk = new SDK({ baseURL: 'https://api.example.com' }).use(BookingPlugin).use(PaymentPlugin);

const bookings = sdk.get<BookingDataSource>('bookings');
const allBookings = await bookings.getAll();
```

### Option 3: Direct Datasources (No Plugins)

```typescript
import { ApiClient, BookingDataSource } from '@your-org/sdk';

const client = new ApiClient({ baseURL: 'https://api.example.com' });
const bookings = new BookingDataSource(client);

const allBookings = await bookings.getAll();
```

### Option 4: Generic Resources (Any Domain)

```typescript
import { BaseDataSource } from '@your-org/sdk';

interface Product {
  id: string;
  name: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

class ProductDataSource extends BaseDataSource<Product> {
  protected endpoint = '/products';
}

const products = new ProductDataSource(client);
```

````

---

## Step 10: Testing Strategy (Ongoing)

Create test file `sdk/src/core/__tests__/ApiClient.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { ApiClient } from '../client';
import { IHttpAdapter } from '../interfaces';

// Mock adapter
class MockAdapter implements IHttpAdapter {
  get = vi.fn();
  post = vi.fn();
  put = vi.fn();
  delete = vi.fn();
  patch = vi.fn();
}

describe('ApiClient', () => {
  it('should use provided adapter', async () => {
    const mockAdapter = new MockAdapter();
    mockAdapter.get.mockResolvedValue({ data: 'test' });

    const client = new ApiClient({
      baseURL: 'https://api.test.com',
      adapter: mockAdapter,
    });

    await client.get('/test');

    expect(mockAdapter.get).toHaveBeenCalled();
  });

  it('should use FetchAdapter by default', () => {
    const client = new ApiClient({ baseURL: 'https://api.test.com' });
    expect(client).toBeDefined();
  });
});
````

---

## Timeline Summary

| Step | Task                  | Time    | Breaking |
| ---- | --------------------- | ------- | -------- |
| 1    | Add interfaces        | 30 min  | ❌ No    |
| 2    | Create adapters       | 2-3 hrs | ❌ No    |
| 3    | Refactor ApiClient    | 1 hr    | ❌ No    |
| 4    | Create BaseDataSource | 2 hrs   | ❌ No    |
| 5    | Refactor datasources  | 3-4 hrs | ❌ No    |
| 6    | Add middleware        | 2-3 hrs | ❌ No    |
| 7    | Plugin system         | 3-4 hrs | ❌ No    |
| 8    | Update exports        | 1 hr    | ⚠️ Minor |
| 9    | Documentation         | 2 hrs   | ❌ No    |
| 10   | Tests                 | Ongoing | ❌ No    |

**Total: 15-20 hours of work**

**Result: Fully modular, backward-compatible SDK!** 🎉

---

## Quick Wins You Can Do Right Now (1-2 hours)

1. **Add the interfaces file** - Defines the contracts
2. **Create FetchAdapter** - Shows the pattern works
3. **Make one datasource use BaseDataSource** - Proves reusability
4. **Document the new pattern** - Help future developers

Then iterate from there!
