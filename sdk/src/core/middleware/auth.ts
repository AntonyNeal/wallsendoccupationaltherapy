/**
 * Authentication Middleware
 *
 * Adds authentication token to requests
 */

import { Middleware } from '../interfaces';

/**
 * Create authentication middleware
 * @param token - Authentication token or function that returns token
 * @returns Middleware function
 */
export const authMiddleware = (token: string | (() => string | Promise<string>)): Middleware => {
  return async (context, next) => {
    const authToken = typeof token === 'function' ? await token() : token;

    if (authToken) {
      context.headers['Authorization'] = `Bearer ${authToken}`;
    }

    return next();
  };
};

/**
 * Create API key middleware
 * @param apiKey - API key
 * @param headerName - Header name (default: 'X-API-Key')
 * @returns Middleware function
 */
export const apiKeyMiddleware = (apiKey: string, headerName: string = 'X-API-Key'): Middleware => {
  return async (context, next) => {
    context.headers[headerName] = apiKey;
    return next();
  };
};
