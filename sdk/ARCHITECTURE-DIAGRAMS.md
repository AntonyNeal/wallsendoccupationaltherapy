# SDK Architecture Diagrams

Visual representations of the modular SDK architecture.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Your Application                         │
│  (React, Vue, Node.js, vanilla JS, or any framework)           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                      SDK v2.0 (Public API)                       │
├─────────────────────────────────────────────────────────────────┤
│  createSDK() → SDK instance                                      │
│  SDK.use(plugin) → Register plugins                              │
│  SDK.get(service) → Get datasource                               │
└────────────────────────────┬────────────────────────────────────┘
                             │
        ┌────────────────────┴────────────────────┐
        │                                         │
        ↓                                         ↓
┌──────────────────┐                    ┌──────────────────┐
│  Plugin System   │                    │   Middleware     │
├──────────────────┤                    ├──────────────────┤
│ • BookingPlugin  │                    │ • Auth           │
│ • TenantPlugin   │                    │ • Retry          │
│ • CustomPlugin   │                    │ • Logging        │
└────────┬─────────┘                    └────────┬─────────┘
         │                                       │
         │         ┌────────────────────────────┘
         │         │
         ↓         ↓
┌─────────────────────────────────────────────────────────────────┐
│                         ApiClient                                │
│  • Handles HTTP requests                                         │
│  • Executes middleware chain                                     │
│  • Manages configuration                                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
┌─────────────────────────────────────────────────────────────────┐
│                       HTTP Adapter                               │
│                   (IHttpAdapter interface)                       │
├─────────────────────────────────────────────────────────────────┤
│  • FetchAdapter (default)                                        │
│  • AxiosAdapter (custom)                                         │
│  • Your custom adapter                                           │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ↓
                      ┌──────────────┐
                      │  Your API    │
                      │   Server     │
                      └──────────────┘
```

## Data Flow

```
User Action (e.g., create booking)
         │
         ↓
┌──────────────────────────────────────┐
│  Application Code                     │
│  bookings.create(data)               │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  DataSource (BookingDataSource)      │
│  • Validates input                   │
│  • Calls client.post()               │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  ApiClient                            │
│  • Builds URL                         │
│  • Merges config                      │
│  • Starts middleware chain            │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  Middleware Chain                     │
│  1. Logging (before)                  │
│  2. Auth (add token)                  │
│  3. Retry (attempt 1)                 │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  HTTP Adapter (FetchAdapter)         │
│  • Creates Request                    │
│  • Calls fetch()                      │
│  • Parses Response                    │
└──────────────┬───────────────────────┘
               │
               ↓
        ┌──────────────┐
        │  HTTP Request │ ──────────→ API Server
        └──────────────┘
               ↑
               │ Response
               ↓
┌──────────────────────────────────────┐
│  Middleware Chain (reverse)          │
│  3. Retry (success)                   │
│  2. Auth (done)                       │
│  1. Logging (after)                   │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  ApiClient                            │
│  • Returns data                       │
└──────────────┬───────────────────────┘
               │
               ↓
┌──────────────────────────────────────┐
│  DataSource                           │
│  • Wraps response                     │
│  • Returns typed result               │
└──────────────┬───────────────────────┘
               │
               ↓
         Application
```

## Plugin System

```
┌──────────────────────────────────────────────────────────────┐
│                        SDK Instance                           │
├──────────────────────────────────────────────────────────────┤
│  plugins: Map<string, Plugin>                                 │
│  services: Map<string, DataSource>                            │
└──────────────────────────────────────────────────────────────┘
                │
                │ .use(BookingPlugin)
                ↓
┌──────────────────────────────────────────────────────────────┐
│                      BookingPlugin                            │
├──────────────────────────────────────────────────────────────┤
│  name: 'booking'                                              │
│  version: '1.0.0'                                             │
│  dependencies: []                                             │
│  initialize(client) {                                         │
│    return {                                                   │
│      bookings: new BookingDataSource(client)                 │
│    }                                                          │
│  }                                                            │
└──────────────────┬───────────────────────────────────────────┘
                   │
                   │ Registers services
                   ↓
┌──────────────────────────────────────────────────────────────┐
│              Service Registry                                 │
├──────────────────────────────────────────────────────────────┤
│  'bookings' → BookingDataSource instance                      │
│  'booking.bookings' → BookingDataSource instance              │
└──────────────────────────────────────────────────────────────┘
                   │
                   │ sdk.get('bookings')
                   ↓
              BookingDataSource
```

## Middleware Chain

```
Request →  M1 (before) →  M2 (before) →  M3 (before) →  HTTP
                                                           │
Response ← M1 (after)  ←  M2 (after)  ←  M3 (after)  ←────┘

Example with logging, auth, retry:

Request
  │
  ↓ loggingMiddleware (before)
  │   console.log('→ POST /bookings')
  │
  ↓ authMiddleware (before)
  │   context.headers['Authorization'] = 'Bearer token'
  │
  ↓ retryMiddleware (before)
  │   attempt = 1
  │
  ↓ ──────────────────→ HTTP Request
  │                           │
  │                           ↓
  │                      API Response
  │                           │
  ↓ ←──────────────────────────
  │
  ↓ retryMiddleware (after)
  │   if (status === 500 && attempt < 3) retry
  │   else return response
  │
  ↓ authMiddleware (after)
  │   (pass through)
  │
  ↓ loggingMiddleware (after)
  │   console.log('← 200 OK (123ms)')
  │
  ↓
Response
```

## Dependency Injection

```
Old (Static - Can't inject):
┌────────────────────────────┐
│  BookingDataSource         │
│  (static methods)          │
│                            │
│  hardcoded API URL ───────→ https://api.example.com
│  hardcoded fetch() ───────→ window.fetch
│                            │
│  ❌ Can't test             │
│  ❌ Can't configure        │
│  ❌ Can't swap adapter     │
└────────────────────────────┘

New (Instance - Dependency Injection):
┌────────────────────────────┐
│  BookingDataSource         │
│  (instance methods)        │
│         ↑                  │
│         │ injected         │
│         │                  │
└─────────┼──────────────────┘
          │
          ↓
┌────────────────────────────┐
│  ApiClient                 │
│         ↑                  │
│         │ injected         │
│         │                  │
└─────────┼──────────────────┘
          │
          ↓
┌────────────────────────────┐
│  IHttpAdapter              │
│  (FetchAdapter/Axios/etc)  │
│                            │
│  ✅ Can test              │
│  ✅ Can configure         │
│  ✅ Can swap adapter      │
└────────────────────────────┘
```

## Class Hierarchy

```
IResource (interface)
    │
    └── Generic Type <T extends IResource>
            │
            ↓
    BaseDataSource<T>
    │
    ├── BookingDataSource extends BaseDataSource<Booking>
    │   │
    │   ├── getAll() [inherited]
    │   ├── getById() [inherited]
    │   ├── create() [inherited]
    │   ├── update() [inherited]
    │   ├── patch() [inherited]
    │   ├── delete() [inherited]
    │   │
    │   └── Domain-specific methods:
    │       ├── createBooking()
    │       ├── updateStatus()
    │       ├── cancel()
    │       ├── confirm()
    │       └── complete()
    │
    ├── TenantDataSource extends BaseDataSource<Tenant>
    │   │
    │   ├── [inherited CRUD methods]
    │   │
    │   └── Domain-specific methods:
    │       ├── getBySubdomain()
    │       ├── getByDomain()
    │       └── getCurrent()
    │
    └── YourDataSource extends BaseDataSource<YourType>
        │
        ├── [inherited CRUD methods]
        │
        └── Your custom methods
```

## Adapter Pattern

```
┌────────────────────────────────────────────────────────────┐
│                  IHttpAdapter (Interface)                   │
├────────────────────────────────────────────────────────────┤
│  + get<T>(url, config): Promise<T>                          │
│  + post<T>(url, data, config): Promise<T>                   │
│  + put<T>(url, data, config): Promise<T>                    │
│  + patch<T>(url, data, config): Promise<T>                  │
│  + delete<T>(url, config): Promise<T>                       │
└────────────────────────────────────────────────────────────┘
                         ↑
         ┌───────────────┼───────────────┐
         │               │               │
         ↓               ↓               ↓
┌──────────────┐  ┌──────────────┐  ┌──────────────┐
│ FetchAdapter │  │ AxiosAdapter │  │ CustomAdapter│
├──────────────┤  ├──────────────┤  ├──────────────┤
│ Uses:        │  │ Uses:        │  │ Uses:        │
│ • fetch()    │  │ • axios      │  │ • your code  │
└──────────────┘  └──────────────┘  └──────────────┘

All implement same interface → ApiClient doesn't care which one
```

## Complete Usage Flow

```
1. Initialize SDK
   ↓
   createSDK({
     baseURL: 'https://api.example.com',
     middleware: [authMiddleware(), retryMiddleware()]
   })

2. Register Plugins
   ↓
   .use(BookingPlugin)
   .use(TenantPlugin)

3. Get Service
   ↓
   const bookings = sdk.get('bookings')

4. Call Method
   ↓
   bookings.getAll()
      │
      ↓ BookingDataSource.getAll()
      │
      ↓ BaseDataSource.getAll()
      │
      ↓ client.get('/bookings')
      │
      ↓ ApiClient.get()
      │
      ↓ executeMiddleware()
      │   ├→ loggingMiddleware
      │   ├→ authMiddleware
      │   └→ retryMiddleware
      │
      ↓ adapter.get()
      │
      ↓ FetchAdapter.get()
      │
      ↓ fetch()
      │
      ↓ API Server
      │
      ↑ Response
      │
      ↑ Parse JSON
      │
      ↑ Return data
      │
      ↑ Middleware (reverse)
      │
      ↑ ApiClient returns
      │
      ↑ BaseDataSource processes
      │
      ↑ BookingDataSource returns
      │
      ↑ Your application receives data

5. Use Data
   ↓
   Display in UI / Process / Save / etc.
```

## Type Safety Flow

```
TypeScript Interfaces
         │
         ↓
┌──────────────────────┐
│  Booking (type)      │
│  {                   │
│    id: number        │
│    name: string      │
│    status: string    │
│    ...              │
│  }                   │
└──────────┬───────────┘
           │
           ↓
┌──────────────────────────────────┐
│  BaseDataSource<Booking>          │
│  • All methods typed with Booking │
└──────────┬────────────────────────┘
           │
           ↓
┌──────────────────────────────────────┐
│  BookingDataSource                    │
│  extends BaseDataSource<Booking>      │
│                                       │
│  getAll(): Promise<Booking[]> ←─── Type-safe
│  getById(id): Promise<Booking> ←─── Type-safe
│  create(data): Promise<Booking> ←─── Type-safe
└──────────┬────────────────────────────┘
           │
           ↓
    Your Application
    (Full type safety!)
```

---

## Summary

The SDK architecture is:

- **Modular** - Plugins compose features
- **Flexible** - Adapters swap implementations
- **Testable** - Dependency injection throughout
- **Type-safe** - TypeScript interfaces everywhere
- **Maintainable** - Clear separation of concerns
- **Extensible** - Easy to add new features
- **Reusable** - Works for any domain
