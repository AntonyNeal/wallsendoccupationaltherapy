/**
 * Retry Middleware
 *
 * Automatically retries failed requests
 */

import { Middleware } from '../interfaces';

export interface RetryOptions {
  /** Maximum number of retry attempts */
  maxAttempts?: number;

  /** Initial delay in milliseconds */
  delayMs?: number;

  /** Multiplier for exponential backoff */
  backoffMultiplier?: number;

  /** HTTP status codes to retry */
  retryableStatuses?: number[];

  /** Callback for retry events */
  onRetry?: (attempt: number, error: Error) => void;
}

/**
 * Create retry middleware
 * @param options - Retry configuration
 * @returns Middleware function
 */
export const retryMiddleware = (options: RetryOptions = {}): Middleware => {
  const {
    maxAttempts = 3,
    delayMs = 1000,
    backoffMultiplier = 2,
    retryableStatuses = [408, 429, 500, 502, 503, 504],
    onRetry,
  } = options;

  return async (context, next) => {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      try {
        const response = await next();

        // Check if status is retryable
        if (retryableStatuses.includes(response.status) && attempt < maxAttempts - 1) {
          lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
          const delay = delayMs * Math.pow(backoffMultiplier, attempt);

          if (onRetry) {
            onRetry(attempt + 1, lastError);
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          continue;
        }

        return response;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        // Don't retry on last attempt
        if (attempt >= maxAttempts - 1) {
          throw lastError;
        }

        const delay = delayMs * Math.pow(backoffMultiplier, attempt);

        if (onRetry) {
          onRetry(attempt + 1, lastError);
        }

        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    throw lastError || new Error('Request failed');
  };
};
