/**
 * Base Data Source
 *
 * Generic CRUD operations that work with any resource type.
 * Extend this class to create domain-specific data sources.
 */

import { ApiClient } from '../client';
import { IDataSource, IResource, QueryParams, ListResponse, ItemResponse } from './interfaces';

/**
 * Options for configuring a data source
 */
export interface DataSourceOptions {
  /** Enable response caching */
  cache?: boolean;

  /** Cache TTL in milliseconds */
  cacheTTL?: number;

  /** Enable automatic retries */
  retry?: boolean;

  /** Number of retry attempts */
  retryAttempts?: number;

  /** Custom response transformation */
  transformResponse?: (data: unknown) => unknown;
}

/**
 * Base Data Source Class
 *
 * Provides standard CRUD operations for any resource type.
 * Override methods to add custom behavior.
 */
export abstract class BaseDataSource<T extends IResource> implements IDataSource<T> {
  /**
   * API endpoint for this resource (e.g., '/bookings', '/products')
   * Must be defined by subclasses
   */
  protected abstract endpoint: string;

  /**
   * Optional configuration options
   */
  protected options?: DataSourceOptions;

  /**
   * Constructor
   * @param client - API client instance
   * @param options - Optional configuration
   */
  constructor(
    protected client: ApiClient,
    options?: DataSourceOptions
  ) {
    this.options = options;
  }

  /**
   * Get all resources
   * @param params - Optional query parameters for filtering, sorting, pagination
   * @returns Array of resources
   */
  async getAll(params?: QueryParams): Promise<T[]> {
    try {
      const response = await this.client.get<ListResponse<T> | ItemResponse<T[]>>(this.endpoint, {
        params: params as Record<string, string | number | boolean>,
      });

      // Handle both response formats
      if ('data' in response) {
        return Array.isArray(response.data) ? response.data : ([response.data] as T[]);
      }

      // Fallback for direct array response
      return response as T[];
    } catch (error) {
      this.handleError('getAll', error);
      throw error;
    }
  }

  /**
   * Get a single resource by ID
   * @param id - Resource identifier
   * @returns Single resource
   */
  async getById(id: string | number): Promise<T> {
    try {
      const response = await this.client.get<ItemResponse<T> | T>(`${this.endpoint}/${id}`);

      // Handle wrapped response
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ItemResponse<T>).data;
      }

      // Handle direct response
      return response as T;
    } catch (error) {
      this.handleError('getById', error);
      throw error;
    }
  }

  /**
   * Create a new resource
   * @param data - Resource data (without id, createdAt, updatedAt)
   * @returns Created resource with generated fields
   */
  async create(data: Partial<Omit<T, 'id' | 'createdAt' | 'updatedAt'>>): Promise<T> {
    try {
      const response = await this.client.post<ItemResponse<T> | T>(this.endpoint, data);

      // Handle wrapped response
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ItemResponse<T>).data;
      }

      // Handle direct response
      return response as T;
    } catch (error) {
      this.handleError('create', error);
      throw error;
    }
  }

  /**
   * Update an existing resource
   * @param id - Resource identifier
   * @param data - Partial resource data to update
   * @returns Updated resource
   */
  async update(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const response = await this.client.put<ItemResponse<T> | T>(`${this.endpoint}/${id}`, data);

      // Handle wrapped response
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ItemResponse<T>).data;
      }

      // Handle direct response
      return response as T;
    } catch (error) {
      this.handleError('update', error);
      throw error;
    }
  }

  /**
   * Partially update a resource
   * @param id - Resource identifier
   * @param data - Partial resource data to update
   * @returns Updated resource
   */
  async patch(id: string | number, data: Partial<T>): Promise<T> {
    try {
      const response = await this.client.patch<ItemResponse<T> | T>(`${this.endpoint}/${id}`, data);

      // Handle wrapped response
      if (response && typeof response === 'object' && 'data' in response) {
        return (response as ItemResponse<T>).data;
      }

      // Handle direct response
      return response as T;
    } catch (error) {
      this.handleError('patch', error);
      throw error;
    }
  }

  /**
   * Delete a resource
   * @param id - Resource identifier
   */
  async delete(id: string | number): Promise<void> {
    try {
      await this.client.delete<void>(`${this.endpoint}/${id}`);
    } catch (error) {
      this.handleError('delete', error);
      throw error;
    }
  }

  /**
   * Handle errors consistently
   * @param operation - Name of the operation that failed
   * @param error - The error that occurred
   */
  protected handleError(operation: string, error: unknown): void {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`[${this.constructor.name}] ${operation} failed:`, errorMessage);
  }
}

/**
 * Generic Resource Data Source
 *
 * Use this when you don't need custom methods, just standard CRUD.
 *
 * @example
 * ```typescript
 * const products = new ResourceDataSource<Product>(client, '/products');
 * const orders = new ResourceDataSource<Order>(client, '/orders');
 * ```
 */
export class ResourceDataSource<T extends IResource> extends BaseDataSource<T> {
  protected endpoint: string;

  constructor(client: ApiClient, endpoint: string, options?: DataSourceOptions) {
    super(client, options);
    this.endpoint = endpoint;
  }
}
