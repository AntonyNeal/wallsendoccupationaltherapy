# Middleware System Guide

The SDK now includes a powerful middleware system that allows you to intercept and modify HTTP requests/responses. Middleware is composable, reusable, and follows a chain-of-responsibility pattern.

## 📚 Table of Contents

- [What is Middleware?](#what-is-middleware)
- [Built-in Middleware](#built-in-middleware)
- [Usage Examples](#usage-examples)
- [Custom Middleware](#custom-middleware)
- [Middleware Composition](#middleware-composition)

## What is Middleware?

Middleware functions intercept HTTP requests before they reach the server and responses before they reach your code. Each middleware can:

- Modify request headers, body, or URL
- Add authentication tokens
- Retry failed requests
- Log requests/responses
- Transform data
- Handle errors

```typescript
type Middleware = (context: MiddlewareContext, next: () => Promise<Response>) => Promise<Response>;
```

## Built-in Middleware

### 🔐 Authentication Middleware

Add authentication tokens to all requests:

```typescript
import { ApiClient } from '@osullivanfarms/sdk';
import { authMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [authMiddleware('your-token-here')],
});
```

**Dynamic tokens:**

```typescript
authMiddleware(() => localStorage.getItem('authToken'));
```

**Async tokens:**

```typescript
authMiddleware(async () => {
  const session = await getSession();
  return session.accessToken;
});
```

**API Key:**

```typescript
import { apiKeyMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [apiKeyMiddleware('your-api-key', 'X-API-Key')],
});
```

### 🔄 Retry Middleware

Automatically retry failed requests with exponential backoff:

```typescript
import { retryMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [
    retryMiddleware({
      maxAttempts: 3,
      delayMs: 1000,
      backoffMultiplier: 2,
      retryableStatuses: [408, 429, 500, 502, 503, 504],
      onRetry: (attempt, error) => {
        console.log(`Retry attempt ${attempt}:`, error.message);
      },
    }),
  ],
});
```

**Options:**

- `maxAttempts` - Maximum retry attempts (default: 3)
- `delayMs` - Initial delay in milliseconds (default: 1000)
- `backoffMultiplier` - Exponential backoff multiplier (default: 2)
- `retryableStatuses` - HTTP status codes to retry (default: [408, 429, 500, 502, 503, 504])
- `onRetry` - Callback for retry events

### 📝 Logging Middleware

Log all HTTP requests and responses:

```typescript
import { loggingMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [
    loggingMiddleware({
      logRequests: true,
      logResponses: true,
      logTiming: true,
      logHeaders: false,
    }),
  ],
});
```

**Custom logger:**

```typescript
loggingMiddleware({
  logger: {
    log: (...args) => myLogger.info(...args),
    error: (...args) => myLogger.error(...args),
    warn: (...args) => myLogger.warn(...args),
    info: (...args) => myLogger.info(...args),
    debug: (...args) => myLogger.debug(...args),
  },
});
```

## Usage Examples

### Basic Setup

```typescript
import { ApiClient } from '@osullivanfarms/sdk';
import { authMiddleware, loggingMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [loggingMiddleware(), authMiddleware('your-token')],
});
```

### Add Middleware After Creation

```typescript
const client = new ApiClient('https://api.example.com');

client.use(loggingMiddleware());
client.use(authMiddleware('your-token'));
```

### Full Stack Example

```typescript
import { ApiClient } from '@osullivanfarms/sdk';
import { loggingMiddleware, authMiddleware, retryMiddleware } from '@osullivanfarms/sdk/middleware';

const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [
    // Log first (see everything)
    loggingMiddleware({
      logTiming: true,
      logHeaders: process.env.NODE_ENV === 'development',
    }),

    // Add auth
    authMiddleware(async () => {
      const token = await getAuthToken();
      return token;
    }),

    // Retry last (retry with auth)
    retryMiddleware({
      maxAttempts: 3,
      onRetry: (attempt) => console.log(`Retrying... attempt ${attempt}`),
    }),
  ],
});
```

## Custom Middleware

Create your own middleware for custom behavior:

```typescript
import { Middleware } from '@osullivanfarms/sdk';

// Add custom header
const customHeaderMiddleware: Middleware = async (context, next) => {
  context.headers['X-Custom-Header'] = 'my-value';
  return next();
};

// Transform response
const responseTransformMiddleware: Middleware = async (context, next) => {
  const response = await next();

  // Modify response data
  if (response.data) {
    response.data = transformData(response.data);
  }

  return response;
};

// Error handling
const errorHandlerMiddleware: Middleware = async (context, next) => {
  try {
    return await next();
  } catch (error) {
    console.error('Request failed:', error);

    // Transform error
    throw new CustomError(error);
  }
};

// Conditional middleware
const conditionalMiddleware: Middleware = async (context, next) => {
  if (context.url.includes('/admin')) {
    context.headers['X-Admin-Request'] = 'true';
  }
  return next();
};
```

## Middleware Composition

Middleware executes in the order it's added:

```typescript
const client = new ApiClient({
  baseURL: 'https://api.example.com',
  middleware: [
    middleware1, // Executes first
    middleware2, // Executes second
    middleware3, // Executes third (closest to actual request)
  ],
});
```

**Execution flow:**

```
Request
  ↓
middleware1 (before next())
  ↓
middleware2 (before next())
  ↓
middleware3 (before next())
  ↓
[Actual HTTP Request]
  ↓
middleware3 (after next())
  ↓
middleware2 (after next())
  ↓
middleware1 (after next())
  ↓
Response
```

**Example:**

```typescript
const loggingMiddleware: Middleware = async (context, next) => {
  console.log('→ Request:', context.method, context.url);
  const response = await next();
  console.log('← Response:', response.status);
  return response;
};

const timingMiddleware: Middleware = async (context, next) => {
  const start = Date.now();
  const response = await next();
  const duration = Date.now() - start;
  console.log(`Request took ${duration}ms`);
  return response;
};

// Both middlewares will log
client.use(loggingMiddleware);
client.use(timingMiddleware);
```

## Best Practices

### 1. Order Matters

Place middleware in logical order:

- **Logging first** - See all requests
- **Auth second** - Add authentication
- **Retry last** - Retry with auth headers

```typescript
middleware: [loggingMiddleware(), authMiddleware('token'), retryMiddleware()];
```

### 2. Always Call `next()`

Middleware must call `next()` to continue the chain:

```typescript
// ✅ Correct
const middleware: Middleware = async (context, next) => {
  // Do something before
  const response = await next();
  // Do something after
  return response;
};

// ❌ Wrong - breaks the chain
const middleware: Middleware = async (context, next) => {
  // Forgot to call next()
  return {} as Response;
};
```

### 3. Handle Errors

Wrap `next()` in try-catch for error handling:

```typescript
const errorMiddleware: Middleware = async (context, next) => {
  try {
    return await next();
  } catch (error) {
    console.error('Request failed:', error);
    throw error; // Re-throw or handle
  }
};
```

### 4. Reusable Middleware

Create factory functions for configurable middleware:

```typescript
export const createRateLimitMiddleware = (requestsPerMinute: number): Middleware => {
  let requests = 0;
  let resetTime = Date.now() + 60000;

  return async (context, next) => {
    if (Date.now() > resetTime) {
      requests = 0;
      resetTime = Date.now() + 60000;
    }

    if (requests >= requestsPerMinute) {
      throw new Error('Rate limit exceeded');
    }

    requests++;
    return next();
  };
};
```

## Testing Middleware

```typescript
import { describe, it, expect, vi } from 'vitest';
import { authMiddleware } from './auth';

describe('authMiddleware', () => {
  it('should add authorization header', async () => {
    const middleware = authMiddleware('test-token');
    const context = { headers: {}, method: 'GET', url: '/test' };
    const next = vi.fn().mockResolvedValue({ status: 200 });

    await middleware(context, next);

    expect(context.headers['Authorization']).toBe('Bearer test-token');
    expect(next).toHaveBeenCalled();
  });
});
```

## Next Steps

- [Core Interfaces](./core/interfaces.ts) - See all available types
- [HTTP Adapters](./ADAPTERS-GUIDE.md) - Custom HTTP clients
- [Base DataSource](./core/BaseDataSource.ts) - Generic CRUD operations
- [Implementation Guide](./IMPLEMENTATION-GUIDE.md) - Full architecture overview
