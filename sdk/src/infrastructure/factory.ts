/**
 * Provider Factory
 * Simplifies creation of cloud providers and infrastructure stacks
 */

// Declare process for Node.js environment
declare const process: {
  env: Record<string, string | undefined>;
} | undefined;

import type { CloudProvider, StackConfig, CloudProviderConfig } from './interfaces';
import { AzureProvider } from './providers/azure';
import { DigitalOceanProvider } from './providers/digitalocean';

export interface ProviderConfig {
  provider: 'azure' | 'digitalocean';
  credentials?: {
    // Azure credentials (optional - uses Azure CLI by default)
    subscriptionId?: string;
    
    // DigitalOcean credentials
    apiToken?: string;
    
    // Spaces credentials (if different from DO token)
    spacesKey?: string;
    spacesSecret?: string;
  };
}

/**
 * Create a cloud provider instance
 * 
 * @example
 * ```typescript
 * // Azure with default CLI credentials
 * const azure = createProvider({ provider: 'azure' });
 * 
 * // Azure with specific subscription
 * const azure = createProvider({
 *   provider: 'azure',
 *   credentials: { subscriptionId: 'your-sub-id' }
 * });
 * 
 * // DigitalOcean
 * const ocean = createProvider({
 *   provider: 'digitalocean',
 *   credentials: { apiToken: process.env.DO_TOKEN }
 * });
 * ```
 */
export function createProvider(config: ProviderConfig): CloudProvider {
  switch (config.provider) {
    case 'azure':
      const azureConfig: CloudProviderConfig = {
        provider: 'azure',
        credentials: {
          subscriptionId: config.credentials?.subscriptionId || '',
        },
      };
      return new AzureProvider(azureConfig);
    
    case 'digitalocean':
      if (!config.credentials?.apiToken) {
        throw new Error('DigitalOcean API token is required');
      }
      const doConfig: CloudProviderConfig = {
        provider: 'digitalocean',
        credentials: {
          apiToken: config.credentials.apiToken,
          spacesKey: config.credentials.spacesKey || '',
          spacesSecret: config.credentials.spacesSecret || '',
        },
      };
      return new DigitalOceanProvider(doConfig);
    
    default:
      throw new Error(`Unsupported provider: ${config.provider}`);
  }
}

/**
 * Create and configure an infrastructure stack
 * 
 * @example
 * ```typescript
 * const provider = createProvider({ provider: 'azure' });
 * 
 * const stack = createStack(provider, {
 *   resourceGroup: {
 *     name: 'my-app',
 *     location: 'eastus'
 *   },
 *   database: {
 *     name: 'my-db',
 *     engine: 'postgres',
 *     version: '15',
 *     tier: 'basic',
 *     adminUsername: 'dbadmin',
 *     adminPassword: 'SecurePass123!'
 *   },
 *   staticWebApp: {
 *     name: 'my-web-app',
 *     repositoryUrl: 'https://github.com/user/repo',
 *     branch: 'main',
 *     buildCommand: 'npm run build',
 *     outputDirectory: 'dist'
 *   }
 * });
 * 
 * await stack.deploy();
 * ```
 */
export function createStack(provider: CloudProvider, config: StackConfig) {
  return provider.createStack(config.resourceGroup.name, config);
}

/**
 * Quick deployment helper - combines provider and stack creation
 * 
 * @example
 * ```typescript
 * const result = await quickDeploy({
 *   provider: 'azure',
 *   stack: {
 *     resourceGroup: { name: 'my-app', location: 'eastus' },
 *     staticWebApp: {
 *       name: 'my-web',
 *       buildCommand: 'npm run build',
 *       outputDirectory: 'dist'
 *     }
 *   }
 * });
 * 
 * console.log('Deployed:', result.staticWebApp?.url);
 * ```
 */
export async function quickDeploy(config: {
  provider: ProviderConfig['provider'];
  credentials?: ProviderConfig['credentials'];
  stack: StackConfig;
}) {
  const provider = createProvider({
    provider: config.provider,
    credentials: config.credentials,
  });
  
  const stack = createStack(provider, config.stack);
  return await stack.deploy();
}

/**
 * Multi-provider deployment helper
 * Deploys the same configuration to multiple providers
 * 
 * @example
 * ```typescript
 * const results = await multiProviderDeploy({
 *   providers: [
 *     { provider: 'azure' },
 *     { provider: 'digitalocean', credentials: { apiToken: process.env.DO_TOKEN } }
 *   ],
 *   stack: {
 *     resourceGroup: { name: 'my-app', location: 'eastus' },
 *     staticWebApp: {
 *       name: 'my-web',
 *       buildCommand: 'npm run build',
 *       outputDirectory: 'dist'
 *     }
 *   }
 * });
 * 
 * results.azure // Azure deployment result
 * results.digitalocean // DigitalOcean deployment result
 * ```
 */
export async function multiProviderDeploy(config: {
  providers: ProviderConfig[];
  stack: StackConfig;
}) {
  const deployments = config.providers.map(async (providerConfig) => {
    const provider = createProvider(providerConfig);
    const stack = createStack(provider, config.stack);
    return {
      provider: providerConfig.provider,
      result: await stack.deploy(),
    };
  });
  
  const results = await Promise.all(deployments);
  
  return results.reduce((acc, { provider, result }) => {
    acc[provider] = result;
    return acc;
  }, {} as Record<string, any>);
}

/**
 * Provider detection helper
 * Attempts to determine available provider based on environment
 */
export function detectProvider(): ProviderConfig['provider'] | null {
  // Node.js environment check
  if (typeof process !== 'undefined' && process?.env) {
    // Check for Azure CLI
    if (process.env['AZURE_SUBSCRIPTION_ID'] || process.env['ARM_SUBSCRIPTION_ID']) {
      return 'azure';
    }
    
    // Check for DigitalOcean token
    if (process.env['DO_TOKEN'] || process.env['DIGITALOCEAN_TOKEN']) {
      return 'digitalocean';
    }
  }
  
  return null;
}

/**
 * Auto-configure provider from environment
 * 
 * @example
 * ```typescript
 * // Set environment: export DO_TOKEN="your-token"
 * const provider = autoConfigureProvider();
 * if (!provider) {
 *   throw new Error('No cloud provider configured');
 * }
 * ```
 */
export function autoConfigureProvider(): CloudProvider | null {
  const providerType = detectProvider();
  if (!providerType) return null;
  
  // Ensure process is available
  if (typeof process === 'undefined' || !process?.env) {
    throw new Error('process.env not available for auto-configuration');
  }
  
  const config: ProviderConfig = { provider: providerType };
  
  if (providerType === 'digitalocean') {
    config.credentials = {
      apiToken: process.env['DO_TOKEN'] || process.env['DIGITALOCEAN_TOKEN'] || '',
      spacesKey: process.env['SPACES_KEY'],
      spacesSecret: process.env['SPACES_SECRET'],
    };
  } else if (providerType === 'azure') {
    config.credentials = {
      subscriptionId: process.env['AZURE_SUBSCRIPTION_ID'] || process.env['ARM_SUBSCRIPTION_ID'],
    };
  }
  
  return createProvider(config);
}
