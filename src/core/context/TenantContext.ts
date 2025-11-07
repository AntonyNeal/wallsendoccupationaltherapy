import { createContext } from 'react';
import type { TenantContextValue } from '../types/tenant.types';

export const TenantContext = createContext<TenantContextValue | undefined>(undefined);
