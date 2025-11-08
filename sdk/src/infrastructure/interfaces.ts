/**
 * Cloud Infrastructure Abstractions
 * Platform-agnostic interfaces for infrastructure resources
 */

/**
 * Base configuration for any cloud provider
 */
export interface CloudProviderConfig {
  provider: 'azure' | 'digitalocean' | 'aws' | 'gcp' | 'vercel' | 'netlify';
  credentials: {
    [key: string]: string;
  };
  region?: string;
  tags?: Record<string, string>;
}

/**
 * Resource group or project container
 */
export interface IResourceGroup {
  name: string;
  location: string;
  tags?: Record<string, string>;
  
  create(): Promise<ResourceGroupResult>;
  delete(): Promise<void>;
  exists(): Promise<boolean>;
}

export interface ResourceGroupResult {
  id: string;
  name: string;
  location: string;
}

/**
 * Relational database (PostgreSQL, MySQL, etc)
 */
export interface IDatabase {
  name: string;
  engine: 'postgresql' | 'mysql' | 'mariadb';
  version: string;
  tier: 'free' | 'basic' | 'standard' | 'premium';
  
  create(): Promise<DatabaseResult>;
  delete(): Promise<void>;
  getConnectionString(): Promise<string>;
  createDatabase(dbName: string): Promise<void>;
  createUser(username: string, password: string): Promise<void>;
}

export interface DatabaseResult {
  id: string;
  name: string;
  host: string;
  port: number;
  adminUsername: string;
  connectionString: string;
}

/**
 * Static website hosting (SPA)
 */
export interface IStaticWebApp {
  name: string;
  buildSettings: {
    buildCommand: string;
    outputDirectory: string;
    installCommand?: string;
  };
  
  create(): Promise<StaticWebAppResult>;
  delete(): Promise<void>;
  deploy(sourceDirectory: string): Promise<void>;
  addCustomDomain(domain: string): Promise<DomainResult>;
  removeCustomDomain(domain: string): Promise<void>;
  listCustomDomains(): Promise<DomainResult[]>;
}

export interface StaticWebAppResult {
  id: string;
  name: string;
  defaultHostname: string;
  repositoryUrl?: string;
}

export interface DomainResult {
  hostname: string;
  status: 'Validating' | 'Ready' | 'Failed';
  validationToken?: string;
  sslState: 'Disabled' | 'Enabled' | 'Pending';
}

/**
 * Application hosting (Node.js, Python, etc)
 */
export interface IAppService {
  name: string;
  runtime: 'node' | 'python' | 'dotnet' | 'java' | 'php';
  runtimeVersion: string;
  tier: 'free' | 'basic' | 'standard' | 'premium';
  
  create(): Promise<AppServiceResult>;
  delete(): Promise<void>;
  deploy(sourceDirectory: string): Promise<void>;
  setEnvironmentVariables(vars: Record<string, string>): Promise<void>;
  getEnvironmentVariables(): Promise<Record<string, string>>;
  restart(): Promise<void>;
  getLogs(lines?: number): Promise<string>;
}

export interface AppServiceResult {
  id: string;
  name: string;
  hostname: string;
  state: 'Running' | 'Stopped';
}

/**
 * CDN / Edge network
 */
export interface ICDN {
  name: string;
  origin: string;
  
  create(): Promise<CDNResult>;
  delete(): Promise<void>;
  purgeCache(paths?: string[]): Promise<void>;
  addCustomDomain(domain: string): Promise<void>;
}

export interface CDNResult {
  id: string;
  name: string;
  endpoint: string;
}

/**
 * DNS management
 */
export interface IDNSZone {
  name: string;
  
  create(): Promise<DNSZoneResult>;
  delete(): Promise<void>;
  addRecord(record: DNSRecord): Promise<void>;
  removeRecord(record: DNSRecord): Promise<void>;
  listRecords(): Promise<DNSRecord[]>;
}

export interface DNSZoneResult {
  id: string;
  name: string;
  nameServers: string[];
}

export interface DNSRecord {
  type: 'A' | 'AAAA' | 'CNAME' | 'TXT' | 'MX' | 'SRV';
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
}

/**
 * Object storage (files, images, etc)
 */
export interface IStorage {
  name: string;
  
  create(): Promise<StorageResult>;
  delete(): Promise<void>;
  uploadFile(localPath: string, remotePath: string): Promise<string>;
  downloadFile(remotePath: string, localPath: string): Promise<void>;
  deleteFile(remotePath: string): Promise<void>;
  listFiles(prefix?: string): Promise<StorageFile[]>;
  getPublicUrl(remotePath: string): string;
}

export interface StorageResult {
  id: string;
  name: string;
  endpoint: string;
}

export interface StorageFile {
  name: string;
  size: number;
  lastModified: Date;
  url: string;
}

/**
 * Complete infrastructure stack
 */
export interface IInfrastructureStack {
  name: string;
  provider: CloudProviderConfig;
  
  // Resources
  resourceGroup?: IResourceGroup;
  database?: IDatabase;
  staticWebApp?: IStaticWebApp;
  appService?: IAppService;
  cdn?: ICDN;
  dnsZone?: IDNSZone;
  storage?: IStorage;
  
  // Stack operations
  deploy(): Promise<StackDeploymentResult>;
  destroy(): Promise<void>;
  getStatus(): Promise<StackStatus>;
  exportConfig(): Promise<string>; // Terraform, ARM, etc
}

export interface StackDeploymentResult {
  success: boolean;
  resources: {
    resourceGroup?: ResourceGroupResult;
    database?: DatabaseResult;
    staticWebApp?: StaticWebAppResult;
    appService?: AppServiceResult;
    cdn?: CDNResult;
    storage?: StorageResult;
  };
  errors?: string[];
  duration: number;
}

export interface StackStatus {
  name: string;
  provider: string;
  state: 'deploying' | 'ready' | 'failed' | 'destroying';
  resources: {
    [key: string]: {
      type: string;
      status: 'creating' | 'ready' | 'updating' | 'deleting' | 'failed';
      error?: string;
    };
  };
}

/**
 * Base class for cloud providers to extend
 */
export abstract class CloudProvider {
  protected config: CloudProviderConfig;
  
  constructor(config: CloudProviderConfig) {
    this.config = config;
  }
  
  abstract createResourceGroup(name: string, location: string): IResourceGroup;
  abstract createDatabase(name: string, config: DatabaseConfig): IDatabase;
  abstract createStaticWebApp(name: string, config: StaticWebAppConfig): IStaticWebApp;
  abstract createAppService(name: string, config: AppServiceConfig): IAppService;
  abstract createCDN(name: string, origin: string): ICDN;
  abstract createDNSZone(name: string): IDNSZone;
  abstract createStorage(name: string): IStorage;
  abstract createStack(name: string, config: StackConfig): IInfrastructureStack;
}

/**
 * Configuration types for resource creation
 */
export interface DatabaseConfig {
  engine: 'postgresql' | 'mysql' | 'mariadb';
  version: string;
  tier: 'free' | 'basic' | 'standard' | 'premium';
  storage?: number; // GB
  adminUsername: string;
  adminPassword: string;
  allowedIPs?: string[];
}

export interface StaticWebAppConfig {
  buildCommand: string;
  outputDirectory: string;
  installCommand?: string;
  repositoryUrl?: string;
  branch?: string;
}

export interface AppServiceConfig {
  runtime: 'node' | 'python' | 'dotnet' | 'java' | 'php';
  runtimeVersion: string;
  tier: 'free' | 'basic' | 'standard' | 'premium';
  environmentVariables?: Record<string, string>;
  alwaysOn?: boolean;
}

export interface StackConfig {
  resourceGroup: {
    name: string;
    location: string;
  };
  database?: DatabaseConfig & { name: string };
  staticWebApp?: StaticWebAppConfig & { name: string };
  appService?: AppServiceConfig & { name: string };
  cdn?: { name: string; origin: string };
  dnsZone?: { name: string };
  storage?: { name: string };
}
