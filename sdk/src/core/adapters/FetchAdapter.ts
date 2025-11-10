/**
 * Fetch API Adapter
 * Uses native fetch API (works in browsers and modern Node.js)
 */

import { IHttpAdapter, RequestConfig, ResponseError } from '../interfaces';

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

    const body = data !== undefined ? JSON.stringify(data) : undefined;

    const init: globalThis.RequestInit = {
      method,
      headers,
      body,
      signal: config?.signal,
    };

    return new Request(url, init);
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const error: ResponseError = new Error(
        `HTTP Error: ${response.status} ${response.statusText}`
      );
      error.status = response.status;
      error.statusText = response.statusText;

      try {
        error.data = await response.json();
      } catch {
        // Response body is not JSON
      }

      throw error;
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return undefined as T;
    }

    return response.json();
  }

  async get<T>(url: string, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'GET', undefined, config);
    const response = await fetch(request);
    return this.handleResponse<T>(response);
  }

  async post<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'POST', data, config);
    const response = await fetch(request);
    return this.handleResponse<T>(response);
  }

  async put<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'PUT', data, config);
    const response = await fetch(request);
    return this.handleResponse<T>(response);
  }

  async delete<T>(url: string, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'DELETE', undefined, config);
    const response = await fetch(request);
    return this.handleResponse<T>(response);
  }

  async patch<T>(url: string, data?: unknown, config?: RequestConfig): Promise<T> {
    const request = this.buildRequest(url, 'PATCH', data, config);
    const response = await fetch(request);
    return this.handleResponse<T>(response);
  }
}
