/**
 * Tenant Registry
 *
 * Central mapping of all active tenants
 */

import claireConfig from './claire';
import type { TenantConfig } from '../core/types/tenant.types';

/**
 * All active tenant configurations
 */
export const tenants: Record<string, TenantConfig> = {
  claire: claireConfig,
  // Add new tenants here:
  // sophie: sophieConfig,
  // emma: emmaConfig,
};

/**
 * Get tenant by subdomain
 */
export function getTenantBySubdomain(subdomain: string): TenantConfig | null {
  return tenants[subdomain] || null;
}

/**
 * Get tenant by custom domain
 */
export function getTenantByDomain(domain: string): TenantConfig | null {
  const tenant = Object.values(tenants).find((t) => t.customDomain === domain);
  return tenant || null;
}

/**
 * List all active tenants
 */
export function getAllTenants(): TenantConfig[] {
  return Object.values(tenants).filter((t) => t.status !== 'inactive');
}

/**
 * Get default tenant (fallback)
 */
export function getDefaultTenant(): TenantConfig {
  return claireConfig;
}
