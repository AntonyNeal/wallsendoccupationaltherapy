# SDK Modular Architecture Proposal

> **🎯 Goal:** Transform the SDK into a Lego-like kit with interchangeable, pluggable components that work across any project type.

---

## 🧩 Current Issues & Proposed Solutions

### Issue 1: Hardcoded Dependencies

**Current:** `ApiClient` hardcoded to `https://avaliable.pro/api`  
**Problem:** Not portable between projects

**Solution: Plugin-based HTTP adapter pattern**

```typescript
// Define interface that any HTTP client must implement
export interface IHttpAdapter {
  get<T>(url: string, config?: RequestConfig): Promise<T>;
  post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T>;
  delete<T>(url: string, config?: RequestConfig): Promise<T>;
}

// Built-in adapters
export class FetchAdapter implements IHttpAdapter { ... }
export class AxiosAdapter implements IHttpAdapter { ... }
export class UndiciAdapter implements IHttpAdapter { ... }

// Client accepts any adapter
export class ApiClient {
  constructor(
    private adapter: IHttpAdapter,
    private config: ClientConfig
  ) {}
}

// Usage in any project
const client = new ApiClient(
  new FetchAdapter(),
  { baseURL: 'https://your-domain.com/api' }
);
```

---

### Issue 2: Static DataSources

**Current:** `BookingDataSource` with static methods and hardcoded client  
**Problem:** Can't inject dependencies, hard to test, not configurable

**Solution: Instance-based pattern with dependency injection**

```typescript
// Base interface all data sources implement
export interface IDataSource<T> {
  client: ApiClient;
  getAll(params?: QueryParams): Promise<T[]>;
  getById(id: string | number): Promise<T>;
  create(data: Partial<T>): Promise<T>;
  update(id: string | number, data: Partial<T>): Promise<T>;
  delete(id: string | number): Promise<void>;
}

// Abstract base class for common functionality
export abstract class BaseDataSource<T> implements IDataSource<T> {
  constructor(protected client: ApiClient) {}

  protected abstract endpoint: string;

  async getAll(params?: QueryParams): Promise<T[]> {
    return this.client.get(`${this.endpoint}`, { params });
  }

  async getById(id: string | number): Promise<T> {
    return this.client.get(`${this.endpoint}/${id}`);
  }

  // ... common CRUD methods
}

// Specific datasource extends base
export class BookingDataSource extends BaseDataSource<Booking> {
  protected endpoint = '/bookings';

  // Add booking-specific methods
  async confirm(id: string): Promise<Booking> {
    return this.client.post(`${this.endpoint}/${id}/confirm`);
  }
}

// Usage - inject dependencies
const client = new ApiClient(adapter, config);
const bookings = new BookingDataSource(client);
const tenants = new TenantDataSource(client);
```

---

### Issue 3: No Plugin System

**Current:** Everything bundled together  
**Problem:** Can't pick and choose features, large bundle size

**Solution: Modular plugin architecture**

```typescript
// Core SDK with plugin system
export class SDK {
  private plugins: Map<string, Plugin> = new Map();

  constructor(private config: SDKConfig) {}

  use(plugin: Plugin): this {
    plugin.install(this);
    this.plugins.set(plugin.name, plugin);
    return this;
  }

  get<T>(name: string): T | undefined {
    return this.plugins.get(name)?.exports as T;
  }
}

// Plugin interface
export interface Plugin {
  name: string;
  version: string;
  dependencies?: string[];
  install(sdk: SDK): void;
  exports?: unknown;
}

// Usage - compose only what you need
const sdk = new SDK({ apiUrl: 'https://api.example.com' })
  .use(BookingPlugin)
  .use(PaymentPlugin)
  .use(AnalyticsPlugin);

const bookings = sdk.get<BookingDataSource>('bookings');
```

---

### Issue 4: Tightly Coupled to Business Logic

**Current:** Datasources have booking-specific logic  
**Problem:** Can't reuse for other domains (e-commerce, reservations, etc.)

**Solution: Generic resource patterns**

```typescript
// Generic resource interface
export interface IResource {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

// Generic CRUD operations
export class ResourceDataSource<T extends IResource> {
  constructor(
    private client: ApiClient,
    private endpoint: string,
    private options?: DataSourceOptions
  ) {}

  // ... generic methods
}

// Easily adapt to any domain
const products = new ResourceDataSource<Product>(client, '/products');
const orders = new ResourceDataSource<Order>(client, '/orders');
const bookings = new ResourceDataSource<Booking>(client, '/bookings');

// Or extend for custom behavior
export class BookingDataSource extends ResourceDataSource<Booking> {
  constructor(client: ApiClient) {
    super(client, '/bookings', {
      cache: true,
      retries: 3,
    });
  }

  // Add domain-specific methods
  async confirm(id: string) {
    return this.client.post(`${this.endpoint}/${id}/confirm`);
  }
}
```

---

### Issue 5: No Middleware/Interceptor System

**Current:** No way to add cross-cutting concerns  
**Problem:** Can't add logging, auth, retries, caching

**Solution: Middleware chain pattern**

```typescript
export type Middleware = (request: Request, next: () => Promise<Response>) => Promise<Response>;

export class ApiClient {
  private middleware: Middleware[] = [];

  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  private async executeMiddleware(request: Request, index: number = 0): Promise<Response> {
    if (index >= this.middleware.length) {
      return fetch(request);
    }

    return this.middleware[index](request, () => this.executeMiddleware(request, index + 1));
  }
}

// Built-in middleware
export const authMiddleware =
  (token: string): Middleware =>
  async (req, next) => {
    req.headers.set('Authorization', `Bearer ${token}`);
    return next();
  };

export const retryMiddleware =
  (attempts: number): Middleware =>
  async (req, next) => {
    for (let i = 0; i < attempts; i++) {
      try {
        return await next();
      } catch (error) {
        if (i === attempts - 1) throw error;
      }
    }
  };

export const loggingMiddleware: Middleware = async (req, next) => {
  console.log(`[API] ${req.method} ${req.url}`);
  const response = await next();
  console.log(`[API] ${response.status}`);
  return response;
};

// Usage
const client = new ApiClient(adapter, config)
  .use(authMiddleware(token))
  .use(retryMiddleware(3))
  .use(loggingMiddleware);
```

---

### Issue 6: No State Management Integration

**Current:** Direct API calls only  
**Problem:** Can't integrate with React Query, SWR, Redux, etc.

**Solution: Adapter pattern for state libraries**

```typescript
// State management interface
export interface IStateAdapter<T> {
  query(key: string, fetcher: () => Promise<T>): T | undefined;
  mutate(key: string, data: T): Promise<void>;
  invalidate(key: string): Promise<void>;
}

// React Query adapter
export class ReactQueryAdapter<T> implements IStateAdapter<T> {
  constructor(private queryClient: QueryClient) {}

  query(key: string, fetcher: () => Promise<T>) {
    const { data } = useQuery({ queryKey: [key], queryFn: fetcher });
    return data;
  }

  async mutate(key: string, data: T) {
    await this.queryClient.setQueryData([key], data);
  }

  async invalidate(key: string) {
    await this.queryClient.invalidateQueries({ queryKey: [key] });
  }
}

// SWR adapter
export class SWRAdapter<T> implements IStateAdapter<T> { ... }

// Redux adapter
export class ReduxAdapter<T> implements IStateAdapter<T> { ... }

// Datasource with state management
export class StatefulDataSource<T> {
  constructor(
    private dataSource: IDataSource<T>,
    private stateAdapter: IStateAdapter<T>
  ) {}

  getAll() {
    return this.stateAdapter.query('all', () => this.dataSource.getAll());
  }
}

// Usage
const bookings = new StatefulDataSource(
  new BookingDataSource(client),
  new ReactQueryAdapter(queryClient)
);
```

---

### Issue 7: No Validation/Schema System

**Current:** Plain TypeScript interfaces  
**Problem:** No runtime validation, no schema evolution

**Solution: Zod-based validation with adapters**

```typescript
import { z } from 'zod';

// Define schemas
export const BookingSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  clientName: z.string().min(1),
  clientEmail: z.string().email(),
  clientPhone: z.string(),
  serviceType: z.string(),
  preferredDate: z.string().datetime(),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed']),
});

export type Booking = z.infer<typeof BookingSchema>;

// Validated datasource
export class ValidatedDataSource<TSchema extends z.ZodType> {
  constructor(
    private dataSource: IDataSource<z.infer<TSchema>>,
    private schema: TSchema
  ) {}

  async create(data: unknown): Promise<z.infer<TSchema>> {
    const validated = this.schema.parse(data);
    return this.dataSource.create(validated);
  }
}

// Usage
const bookings = new ValidatedDataSource(new BookingDataSource(client), BookingSchema);

// Alternative validators (Yup, Joi, etc.)
export interface IValidator<T> {
  parse(data: unknown): T;
  validate(data: unknown): boolean;
}

export class ZodValidator<T> implements IValidator<T> {
  constructor(private schema: z.ZodType<T>) {}
  parse(data: unknown): T {
    return this.schema.parse(data);
  }
  validate(data: unknown): boolean {
    return this.schema.safeParse(data).success;
  }
}
```

---

### Issue 8: Generators Not Reusable

**Current:** Theme/app generators specific to booking platform  
**Problem:** Can't use for other project types

**Solution: Template engine with composition**

```typescript
// Generic generator interface
export interface IGenerator<TInput, TOutput> {
  name: string;
  generate(input: TInput): Promise<TOutput>;
  validate(input: TInput): boolean;
}

// Composable generator
export class ComposableGenerator<TInput, TOutput> {
  private steps: IGenerator<any, any>[] = [];

  addStep<TStepInput, TStepOutput>(generator: IGenerator<TStepInput, TStepOutput>): this {
    this.steps.push(generator);
    return this;
  }

  async generate(input: TInput): Promise<TOutput> {
    let result: any = input;
    for (const step of this.steps) {
      result = await step.generate(result);
    }
    return result;
  }
}

// Example: Build any type of site
const ecommerceSite = new ComposableGenerator()
  .addStep(new ThemeGenerator())
  .addStep(new ProductPageGenerator())
  .addStep(new CartGenerator())
  .addStep(new CheckoutGenerator())
  .addStep(new DeploymentGenerator());

const bookingSite = new ComposableGenerator()
  .addStep(new ThemeGenerator())
  .addStep(new CalendarGenerator())
  .addStep(new BookingFormGenerator())
  .addStep(new PaymentGenerator())
  .addStep(new DeploymentGenerator());
```

---

## 📦 Proposed Package Structure

```typescript
// Core package (minimal)
@your-org/sdk-core
├── client/
│   ├── interfaces.ts      // IHttpAdapter, IApiClient
│   ├── ApiClient.ts       // Core client
│   └── adapters/
│       ├── FetchAdapter.ts
│       ├── AxiosAdapter.ts
│       └── UndiciAdapter.ts
├── datasources/
│   ├── interfaces.ts      // IDataSource, IResource
│   ├── BaseDataSource.ts  // Generic CRUD
│   └── ResourceDataSource.ts
├── middleware/
│   ├── interfaces.ts      // Middleware type
│   ├── auth.ts
│   ├── retry.ts
│   ├── cache.ts
│   └── logging.ts
└── plugin/
    ├── interfaces.ts      // Plugin interface
    └── SDK.ts            // Plugin system

// Domain packages (optional, install what you need)
@your-org/sdk-booking
├── types.ts              // Booking, Availability types
├── schemas.ts            // Zod schemas
├── BookingDataSource.ts
├── AvailabilityDataSource.ts
└── plugin.ts             // BookingPlugin

@your-org/sdk-payments
├── types.ts
├── schemas.ts
├── PaymentDataSource.ts
└── plugin.ts

@your-org/sdk-analytics
├── types.ts
├── AnalyticsDataSource.ts
└── plugin.ts

// State management adapters
@your-org/sdk-react-query
@your-org/sdk-swr
@your-org/sdk-redux

// Generator packages
@your-org/sdk-generators
├── theme/
├── app/
├── seo/
└── assets/

// Deployment packages
@your-org/sdk-deployment-vercel
@your-org/sdk-deployment-digitalocean
@your-org/sdk-deployment-netlify

// Infrastructure
@your-org/sdk-infrastructure
├── interfaces.ts
├── providers/
│   ├── azure.ts
│   ├── digitalocean.ts
│   └── aws.ts
└── terraform/
```

---

## 🎯 Usage Examples

### Example 1: Minimal E-commerce Project

```typescript
import { SDK } from '@your-org/sdk-core';
import { FetchAdapter } from '@your-org/sdk-core/adapters';
import { ResourceDataSource } from '@your-org/sdk-core/datasources';

// Just use core with generic resources
const sdk = new SDK({
  adapter: new FetchAdapter(),
  baseURL: 'https://my-ecommerce-api.com',
});

const products = new ResourceDataSource(sdk.client, '/products');
const orders = new ResourceDataSource(sdk.client, '/orders');
```

### Example 2: Full Booking Platform

```typescript
import { SDK } from '@your-org/sdk-core';
import { BookingPlugin } from '@your-org/sdk-booking';
import { PaymentPlugin } from '@your-org/sdk-payments';
import { AnalyticsPlugin } from '@your-org/sdk-analytics';
import { ReactQueryAdapter } from '@your-org/sdk-react-query';

const sdk = new SDK({
  baseURL: 'https://api.example.com',
  adapter: new FetchAdapter(),
})
  .use(BookingPlugin)
  .use(PaymentPlugin)
  .use(AnalyticsPlugin)
  .use(ReactQueryAdapter);

// All features available
const bookings = sdk.get('bookings');
const payments = sdk.get('payments');
```

### Example 3: Custom CRM

```typescript
import { SDK } from '@your-org/sdk-core';
import { BaseDataSource } from '@your-org/sdk-core/datasources';
import { authMiddleware, retryMiddleware } from '@your-org/sdk-core/middleware';

// Define your domain types
interface Contact {
  id: string;
  name: string;
  email: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
}

// Use generic datasources
class ContactDataSource extends BaseDataSource<Contact> {
  protected endpoint = '/contacts';
}

class DealDataSource extends BaseDataSource<Deal> {
  protected endpoint = '/deals';
}

// Setup
const client = new ApiClient(new FetchAdapter(), { baseURL: 'https://crm-api.com' })
  .use(authMiddleware(token))
  .use(retryMiddleware(3));

const contacts = new ContactDataSource(client);
const deals = new DealDataSource(client);
```

---

## 🔧 Migration Path

### Phase 1: Add Interfaces (Non-breaking)

- Add `IHttpAdapter`, `IDataSource`, etc.
- Keep existing implementations
- Mark old patterns as deprecated

### Phase 2: Provide Adapters (Non-breaking)

- Add new adapter-based classes
- Existing code still works
- New code can use new patterns

### Phase 3: Split Packages (Breaking)

- Move domain logic to separate packages
- Provide migration guide
- Major version bump

### Phase 4: Deprecate Old Patterns

- Remove deprecated code
- Clean up exports
- Optimize bundle size

---

## 📊 Benefits Summary

| Benefit              | Current               | Proposed            |
| -------------------- | --------------------- | ------------------- |
| **Bundle Size**      | ~200KB (all features) | ~20KB core + opt-in |
| **Reusability**      | Booking-specific      | Any domain          |
| **Testability**      | Hard (static methods) | Easy (DI)           |
| **Extensibility**    | Modify SDK            | Plugins             |
| **Type Safety**      | Compile-time only     | Runtime validation  |
| **State Management** | None                  | Adapters for all    |
| **Multi-project**    | Copy-paste            | Install package     |

---

## 🎨 Design Principles

1. **Interface-driven**: Define contracts, not implementations
2. **Composition over inheritance**: Build with small pieces
3. **Dependency injection**: Never hardcode dependencies
4. **Open-closed**: Open for extension, closed for modification
5. **Single responsibility**: Each module does one thing well
6. **Tree-shakeable**: Import only what you use
7. **Framework-agnostic**: Works with React, Vue, Svelte, vanilla
8. **Platform-agnostic**: Node, browser, edge workers

---

## 🚀 Quick Wins (Implement First)

1. **Add IHttpAdapter interface** - Makes client swappable
2. **Convert static to instance datasources** - Enables DI
3. **Add middleware system** - Cross-cutting concerns
4. **Create BaseDataSource** - Reduces code duplication
5. **Extract deployment templates** - Already done! ✅

---

## 📚 Inspiration From

- **AWS SDK**: Modular packages, plugin system
- **Apollo Client**: Pluggable links/middleware
- **Redux**: Middleware chain
- **Axios**: Interceptors
- **React Query**: Adapter pattern
- **Zod**: Schema-first validation

---

_This proposal maintains backward compatibility while enabling future modularity._
