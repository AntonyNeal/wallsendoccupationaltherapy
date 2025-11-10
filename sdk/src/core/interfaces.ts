/**
 * Core Interfaces for Modular SDK Architecture
 *
 * These interfaces define contracts that enable:
 * - Swappable HTTP adapters (fetch, axios, etc.)
 * - Generic data sources for any domain
 * - Plugin-based extensibility
 * - Middleware chain for cross-cutting concerns
 */

// ============================================================================
// HTTP ADAPTER INTERFACE
// ============================================================================

export interface RequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, string | number | boolean>;
  timeout?: number;
  signal?: AbortSignal;
}

export interface ResponseError extends Error {
  status?: number;
  statusText?: string;
  data?: unknown;
}

/**
 * HTTP Adapter Interface
 * Implement this to create custom HTTP clients (fetch, axios, etc.)
 */
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

/**
 * Base interface for all resources
 * All entities in the system should extend this
 */
export interface IResource {
  id: string | number;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * Query parameters for list/filter operations
 */
export interface QueryParams {
  limit?: number;
  offset?: number;
  page?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filter?: Record<string, unknown>;
  search?: string;
}

/**
 * Standard list response structure
 */
export interface ListResponse<T> {
  data: T[];
  count?: number;
  total?: number;
  page?: number;
  pages?: number;
}

/**
 * Standard single item response structure
 */
export interface ItemResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}

/**
 * Data Source Interface
 * Implement this for CRUD operations on any resource type
 */
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

/**
 * Context passed to middleware
 */
export interface MiddlewareContext {
  url: string;
  method: string;
  headers: Record<string, string>;
  body?: unknown;
  config?: RequestConfig;
}

/**
 * Function to call next middleware in chain
 */
export type MiddlewareNext = () => Promise<Response>;

/**
 * Middleware function type
 * Middleware can modify request, handle response, or add side effects
 */
export type Middleware = (context: MiddlewareContext, next: MiddlewareNext) => Promise<Response>;

// ============================================================================
// PLUGIN INTERFACE
// ============================================================================

/**
 * Plugin Interface
 * Plugins can extend SDK functionality without modifying core code
 */
export interface Plugin {
  /** Unique plugin name */
  name: string;

  /** Plugin version */
  version: string;

  /** Optional plugin dependencies (other plugin names) */
  dependencies?: string[];

  /** Initialize function called when plugin is added to SDK */
  initialize(client: unknown): Record<string, unknown>;

  /** Optional uninstall/cleanup function */
  uninstall?(): void | Promise<void>;
}

// ============================================================================
// SDK CONFIGURATION
// ============================================================================

/**
 * SDK Configuration Options
 */
export interface SDKConfig {
  /** Base URL for API requests */
  baseURL: string;

  /** HTTP adapter to use (defaults to FetchAdapter) */
  adapter?: IHttpAdapter;

  /** Request timeout in milliseconds */
  timeout?: number;

  /** Default headers for all requests */
  headers?: Record<string, string>;

  /** Middleware to apply to all requests */
  middleware?: Middleware[];

  /** Enable debug logging */
  debug?: boolean;

  /** Retry configuration */
  retry?: {
    attempts?: number;
    delay?: number;
  };
}

// ============================================================================
// VALIDATOR INTERFACE (Optional)
// ============================================================================

/**
 * Validator Interface
 * Can be implemented by Zod, Yup, Joi, etc.
 */
export interface IValidator<T> {
  parse(data: unknown): T;
  validate(data: unknown): boolean;
  safeParse(data: unknown): { success: boolean; data?: T; error?: Error };
}

// ============================================================================
// STATE MANAGEMENT ADAPTER INTERFACE (Optional)
// ============================================================================

/**
 * State Management Adapter Interface
 * Implement for React Query, SWR, Redux, etc.
 */
export interface IStateAdapter<T> {
  query(key: string, fetcher: () => Promise<T>): T | undefined;
  mutate(key: string, data: T | ((prev: T | undefined) => T)): Promise<void>;
  invalidate(key: string): Promise<void>;
}

// ============================================================================
// CACHE INTERFACE (Optional)
// ============================================================================

/**
 * Cache Interface
 * Implement for different caching strategies
 */
export interface ICache<T = unknown> {
  get(key: string): T | undefined | Promise<T | undefined>;
  set(key: string, value: T, ttl?: number): void | Promise<void>;
  has(key: string): boolean | Promise<boolean>;
  delete(key: string): boolean | Promise<boolean>;
  clear(): void | Promise<void>;
}

// ============================================================================
// LOGGER INTERFACE (Optional)
// ============================================================================

/**
 * Logger Interface
 * Implement for custom logging
 */
export interface ILogger {
  log(...args: unknown[]): void;
  error(...args: unknown[]): void;
  warn(...args: unknown[]): void;
  info(...args: unknown[]): void;
  debug(...args: unknown[]): void;
}
