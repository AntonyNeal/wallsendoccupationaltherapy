/**
 * Tenant Plugin
 *
 * Adds multi-tenancy support to SDK
 */

import { Plugin } from '../core/interfaces';
import { ApiClient } from '../client';
import { TenantDataSource } from '../datasources/tenant';

/**
 * Tenant plugin for SDK
 */
export const TenantPlugin: Plugin = {
  name: 'tenant',
  version: '1.0.0',

  initialize(client: unknown): Record<string, unknown> {
    const apiClient = client as ApiClient;

    return {
      tenants: new TenantDataSource(apiClient),
    };
  },
};
