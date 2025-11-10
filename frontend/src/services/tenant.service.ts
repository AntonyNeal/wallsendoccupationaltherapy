import api from './api';
import { TenantConfig } from '../types';

export const tenantService = {
  getConfig: async (): Promise<TenantConfig> => {
    const response = await api.get('/tenant/config');
    return response.data;
  },

  getServices: async () => {
    const response = await api.get('/tenant/services');
    return response.data;
  },

  getBusinessInfo: async () => {
    const response = await api.get('/tenant/business-info');
    return response.data;
  },

  getBranding: async () => {
    const response = await api.get('/tenant/branding');
    return response.data;
  },
};

export default tenantService;
