/**
 * SDK - Main entry point for plugin-based SDK
 *
 * Provides plugin registration and service management
 */

import { Plugin, SDKConfig } from './interfaces';
import { ApiClient } from '../client';

export class SDK {
  private client: ApiClient;
  private plugins: Map<string, Plugin> = new Map();
  private services: Map<string, unknown> = new Map();

  /**
   * Create new SDK instance
   * @param config - SDK configuration
   */
  constructor(config: SDKConfig) {
    this.client = new ApiClient(config);
  }

  /**
   * Register a plugin
   * @param plugin - Plugin to register
   */
  use(plugin: Plugin): this {
    // Check dependencies
    if (plugin.dependencies) {
      for (const dep of plugin.dependencies) {
        if (!this.plugins.has(dep)) {
          throw new Error(`Plugin "${plugin.name}" requires "${dep}" to be registered first`);
        }
      }
    }

    // Initialize plugin
    const services = plugin.initialize(this.client);

    // Register services
    Object.entries(services).forEach(([name, service]) => {
      const fullName = `${plugin.name}.${name}`;
      this.services.set(fullName, service);

      // Also register without plugin prefix for convenience
      if (!this.services.has(name)) {
        this.services.set(name, service);
      }
    });

    // Store plugin
    this.plugins.set(plugin.name, plugin);

    return this;
  }

  /**
   * Get a service by name
   * @param name - Service name (e.g., 'bookings' or 'booking.bookings')
   * @returns Service instance
   */
  get<T = unknown>(name: string): T {
    const service = this.services.get(name);

    if (!service) {
      throw new Error(`Service "${name}" not found. Did you register the plugin?`);
    }

    return service as T;
  }

  /**
   * Check if a service exists
   * @param name - Service name
   * @returns True if service exists
   */
  has(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get the API client
   */
  getClient(): ApiClient {
    return this.client;
  }

  /**
   * List all registered plugins
   */
  getPlugins(): string[] {
    return Array.from(this.plugins.keys());
  }

  /**
   * List all registered services
   */
  getServices(): string[] {
    return Array.from(this.services.keys());
  }
}

/**
 * Create SDK instance (convenience function)
 * @param config - SDK configuration
 * @returns SDK instance
 */
export function createSDK(config: SDKConfig): SDK {
  return new SDK(config);
}
