/**
 * API Client - Base HTTP client for all API calls
 *
 * Refactored to use pluggable HTTP adapters and middleware for flexibility
 */

import {
  IHttpAdapter,
  RequestConfig,
  SDKConfig,
  Middleware,
  MiddlewareContext,
} from './core/interfaces';
import { FetchAdapter } from './core/adapters/FetchAdapter';

export class ApiClient {
  private adapter: IHttpAdapter;
  private baseURL: string;
  private defaultConfig?: RequestConfig;
  private middleware: Middleware[] = [];

  /**
   * Create new API client
   * @param config - Configuration with baseURL and optional adapter
   */
  constructor(config: string | SDKConfig) {
    // Backward compatibility: accept string as baseURL
    if (typeof config === 'string') {
      this.baseURL = config;
      this.adapter = new FetchAdapter();
    } else {
      this.baseURL = config.baseURL;
      this.adapter = config.adapter || new FetchAdapter();
      this.middleware = config.middleware || [];
      this.defaultConfig = {
        headers: config.headers,
        timeout: config.timeout,
      };
    }
  }

  /**
   * Add middleware to the client
   * @param middleware - Middleware function
   */
  use(middleware: Middleware): this {
    this.middleware.push(middleware);
    return this;
  }

  /**
   * Build full URL from endpoint and params
   */
  private buildURL(endpoint: string, params?: Record<string, string | number | boolean>): string {
    // Remove leading slash from endpoint to avoid replacing baseURL path
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = new URL(
      cleanEndpoint,
      this.baseURL.endsWith('/') ? this.baseURL : this.baseURL + '/'
    );

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value));
      });
    }

    return url.toString();
  }

  /**
   * Merge configs with defaults
   */
  private mergeConfig(config?: RequestConfig): RequestConfig {
    return {
      ...this.defaultConfig,
      ...config,
      headers: {
        ...this.defaultConfig?.headers,
        ...config?.headers,
      },
    };
  }

  /**
   * Execute middleware chain
   */
  private async executeMiddleware(
    method: string,
    url: string,
    config: RequestConfig,
    body?: unknown
  ): Promise<Response> {
    const context: MiddlewareContext = {
      method,
      url,
      headers: config.headers || {},
      body,
    };

    let index = 0;

    const next = async (): Promise<Response> => {
      if (index < this.middleware.length) {
        const middleware = this.middleware[index++];
        return middleware(context, next);
      }

      // Final step: make the actual request
      // Create a mock Response-like object that can be returned
      const adapterMethod = method.toLowerCase() as 'get' | 'post' | 'put' | 'patch' | 'delete';

      let result: unknown;
      if (adapterMethod === 'get' || adapterMethod === 'delete') {
        type AdapterMethodType = (url: string, config: RequestConfig) => Promise<unknown>;
        result = await (this.adapter[adapterMethod] as AdapterMethodType)(url, config);
      } else {
        type AdapterMethodType = (
          url: string,
          body: unknown,
          config: RequestConfig
        ) => Promise<unknown>;
        result = await (this.adapter[adapterMethod] as AdapterMethodType)(url, body, config);
      }

      return this.wrapResult(result);
    };

    return next();
  }

  /**
   * Wrap adapter result in Response-like object for middleware
   */
  private wrapResult(data: unknown): Response {
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: new Headers(),
      data,
    } as unknown as Response;
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const mergedConfig = this.mergeConfig(config);

    if (this.middleware.length > 0) {
      const response = await this.executeMiddleware('GET', url, mergedConfig);
      return (response as unknown as { data: T }).data;
    }

    return this.adapter.get<T>(url, mergedConfig);
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const mergedConfig = this.mergeConfig(config);

    if (this.middleware.length > 0) {
      const response = await this.executeMiddleware('POST', url, mergedConfig, data);
      return (response as unknown as { data: T }).data;
    }

    return this.adapter.post<T>(url, data, mergedConfig);
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const mergedConfig = this.mergeConfig(config);

    if (this.middleware.length > 0) {
      const response = await this.executeMiddleware('PUT', url, mergedConfig, data);
      return (response as unknown as { data: T }).data;
    }

    return this.adapter.put<T>(url, data, mergedConfig);
  }

  /**
   * PATCH request
   */
  async patch<T>(endpoint: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const mergedConfig = this.mergeConfig(config);

    if (this.middleware.length > 0) {
      const response = await this.executeMiddleware('PATCH', url, mergedConfig, data);
      return (response as unknown as { data: T }).data;
    }

    return this.adapter.patch<T>(url, data, mergedConfig);
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, config?: RequestConfig): Promise<T> {
    const url = this.buildURL(endpoint, config?.params);
    const mergedConfig = this.mergeConfig(config);

    if (this.middleware.length > 0) {
      const response = await this.executeMiddleware('DELETE', url, mergedConfig);
      return (response as unknown as { data: T }).data;
    }

    return this.adapter.delete<T>(url, mergedConfig);
  }
}
