/**
 * Tenant Data Source - API methods for tenant operations
 *
 * Refactored to extend BaseDataSource with tenant-specific methods
 */

import { BaseDataSource } from '../core/BaseDataSource';
import { Tenant, ApiResponse } from '../types';

/**
 * Tenant Data Source
 *
 * Provides standard CRUD operations plus tenant-specific lookup methods
 */
export class TenantDataSource extends BaseDataSource<Tenant> {
  protected endpoint = '/tenants';

  // Inherits from BaseDataSource:
  // - getAll(params?)
  // - getById(id)
  // - create(data)
  // - update(id, data)
  // - delete(id)

  /**
   * Get tenant by subdomain
   */
  async getBySubdomain(subdomain: string): Promise<Tenant> {
    const response = await this.client.get<ApiResponse<Tenant>>(`${this.endpoint}/${subdomain}`);

    if ('data' in response) {
      return response.data;
    }
    return response as Tenant;
  }

  /**
   * Get tenant by custom domain
   */
  async getByDomain(domain: string): Promise<Tenant> {
    const response = await this.client.get<ApiResponse<Tenant>>(
      `${this.endpoint}/domain/${domain}`
    );

    if ('data' in response) {
      return response.data;
    }
    return response as Tenant;
  }

  /**
   * Get current tenant from hostname
   */
  async getCurrent(): Promise<Tenant> {
    const hostname = window.location.hostname;

    // Check for custom domains
    if (hostname === 'clairehamilton.com.au' || hostname === 'www.clairehamilton.com.au') {
      return this.getBySubdomain('claire');
    }

    // Check if clairehamilton.vip (legacy)
    if (hostname === 'clairehamilton.vip' || hostname === 'www.clairehamilton.vip') {
      return this.getBySubdomain('claire');
    }

    // Extract subdomain from platform domains (e.g., claire.avaliable.pro)
    const subdomain = hostname.split('.')[0];
    if (subdomain && subdomain !== 'www') {
      return this.getBySubdomain(subdomain);
    }

    throw new Error('Unable to determine tenant from current hostname');
  }

  /**
   * List all tenants (admin only)
   */
  async list(page: number = 1, limit: number = 20): Promise<Tenant[]> {
    return this.getAll({ page, limit });
  }
}
