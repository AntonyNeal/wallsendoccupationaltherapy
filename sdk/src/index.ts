/**
 * Service Booking Platform SDK - Frontend data sources and app generators
 * @packageDocumentation
 */

// ============================================================================
// CORE - Modular SDK Architecture
// ============================================================================

// Main SDK class (plugin-based)
export { SDK, createSDK } from './core/SDK';
export { ApiClient } from './client';

// Core interfaces
export type {
  IHttpAdapter,
  IDataSource,
  IResource,
  Plugin,
  Middleware,
  MiddlewareContext,
  SDKConfig,
  RequestConfig,
  ResponseError,
  ILogger,
  ICache,
  IStateAdapter,
} from './core/interfaces';

// HTTP Adapters
export { FetchAdapter } from './core/adapters/FetchAdapter';

// Base classes
export { BaseDataSource } from './core/BaseDataSource';

// Middleware
export {
  authMiddleware,
  apiKeyMiddleware,
  retryMiddleware,
  loggingMiddleware,
  type RetryOptions,
  type LoggingOptions,
} from './core/middleware';

// Plugins
export { BookingPlugin, TenantPlugin } from './plugins';

// ============================================================================
// TYPES
// ============================================================================

export * from './types';

// ============================================================================
// DATA SOURCES (Instance-based, extends BaseDataSource)
// ============================================================================

export { TenantDataSource } from './datasources/tenant';
export { BookingDataSource } from './datasources/booking';
export { AvailabilityDataSource } from './datasources/availability';
export { LocationDataSource } from './datasources/location';
export { PaymentDataSource } from './datasources/payment';
export { AnalyticsDataSource } from './datasources/analytics';
export { TenantAnalyticsDataSource } from './datasources/tenantAnalytics';
export { SocialAnalyticsDataSource } from './datasources/socialAnalytics';

// ============================================================================
// GENERATORS
// ============================================================================

export {
  generateTheme,
  parseThemePrompt,
  generateTailwindConfig as generateThemeTailwindConfig,
  generateThemedButton,
  suggestIndustry,
  type ThemePrompt,
  type ThemeConfig,
} from './generators/theme';

export {
  parsePrompt,
  generateApp,
  generateFileStructure,
  type AppPrompt,
  type AppConfig,
  type ContentStructure,
  type PageConfig,
  type FormConfig,
  type DeploymentConfig,
} from './generators/app';

export {
  generateSocialTags,
  generateStructuredData,
  generateRobotsTxt,
  generateSitemap,
  generatePageMeta,
  type SEOConfig,
  type SocialTagsInput,
} from './generators/seo';

export {
  suggestAssets,
  generateAssetChecklist,
  generateAssetCSS,
  type AssetSuggestions,
  type OGImageSpec,
  type FaviconSpec,
  type HeroImageSpec,
  type LogoSpec,
} from './generators/assets';

// ============================================================================
// TOOLS
// ============================================================================

export {
  auditFile,
  auditFiles,
  formatAuditReport,
  generateMigrationScript,
  exportAuditJSON,
  type AuditResult,
  type AuditIssue,
  type AuditReport,
  type AuditSummary,
} from './tools/audit';

// ============================================================================
// INFRASTRUCTURE
// ============================================================================

export type {
  CloudProvider,
  CloudProviderConfig,
  IResourceGroup,
  IDatabase,
  IStaticWebApp,
  IAppService,
  ICDN,
  IDNSZone,
  IStorage,
  IInfrastructureStack,
  DatabaseConfig,
  StaticWebAppConfig,
  AppServiceConfig,
  StackConfig,
  ResourceGroupResult,
  DatabaseResult,
  StaticWebAppResult,
  AppServiceResult,
  CDNResult,
  DNSZoneResult,
  StorageResult,
  DomainResult,
  DNSRecord,
  StorageFile,
  StackDeploymentResult,
  StackStatus,
} from './infrastructure/interfaces';

export { AzureProvider } from './infrastructure/providers/azure';
export { DigitalOceanProvider } from './infrastructure/providers/digitalocean';

export {
  createProvider,
  createStack,
  quickDeploy,
  multiProviderDeploy,
  detectProvider,
  autoConfigureProvider,
  type ProviderConfig,
} from './infrastructure/factory';

export {
  generateTerraformModule,
  writeTerraformFiles,
  type TerraformModule,
} from './infrastructure/terraform';

// ============================================================================
// ADDITIONAL TYPES
// ============================================================================

export type {
  TenantPerformance,
  TrafficSource,
  LocationBooking,
  AvailabilityUtilization,
  ConversionFunnelStage,
  ABTestVariant,
  ABTestResult,
} from './datasources/tenantAnalytics';

export type {
  PostPerformance,
  PostEngagement,
  PostConversions,
  PostAttribution,
  PlatformPerformance,
  TopPost,
  TopHashtag,
  DailyMetric,
  FollowerGrowthPoint,
  FollowerGrowthSummary,
} from './datasources/socialAnalytics';

export type { Payment } from './datasources/payment';

export type {
  TouringLocation,
  CurrentLocation,
  DateAvailability,
  AvailableDate,
} from './datasources/availability';
