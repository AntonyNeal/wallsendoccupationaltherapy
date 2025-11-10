/**
 * Logging Middleware
 *
 * Logs HTTP requests and responses
 */

import { Middleware } from '../interfaces';
import { ILogger } from '../interfaces';

/**
 * Default console logger
 */
const defaultLogger: ILogger = {
  log: (...args) => console.log(...args),
  error: (...args) => console.error(...args),
  warn: (...args) => console.warn(...args),
  info: (...args) => console.info(...args),
  debug: (...args) => console.debug(...args),
};

export interface LoggingOptions {
  /** Custom logger implementation */
  logger?: ILogger;

  /** Log request details */
  logRequests?: boolean;

  /** Log response details */
  logResponses?: boolean;

  /** Log timing information */
  logTiming?: boolean;

  /** Log headers */
  logHeaders?: boolean;
}

/**
 * Create logging middleware
 * @param options - Logging configuration
 * @returns Middleware function
 */
export const loggingMiddleware = (options: LoggingOptions = {}): Middleware => {
  const {
    logger = defaultLogger,
    logRequests = true,
    logResponses = true,
    logTiming = true,
    logHeaders = false,
  } = options;

  return async (context, next) => {
    const start = Date.now();

    // Log request
    if (logRequests) {
      logger.log(`[SDK] → ${context.method} ${context.url}`);

      if (logHeaders) {
        logger.debug('[SDK] Request headers:', context.headers);
      }

      if (context.body) {
        logger.debug('[SDK] Request body:', context.body);
      }
    }

    try {
      const response = await next();
      const duration = Date.now() - start;

      // Log response
      if (logResponses) {
        logger.log(
          `[SDK] ← ${response.status} ${response.statusText}` +
            (logTiming ? ` (${duration}ms)` : '')
        );

        if (logHeaders) {
          const headers: Record<string, string> = {};
          response.headers.forEach((value, key) => {
            headers[key] = value;
          });
          logger.debug('[SDK] Response headers:', headers);
        }
      }

      return response;
    } catch (error) {
      const duration = Date.now() - start;

      logger.error(`[SDK] ✖ ${context.method} ${context.url} failed after ${duration}ms:`, error);

      throw error;
    }
  };
};
