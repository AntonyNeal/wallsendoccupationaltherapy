/**
 * Terraform Module Generator
 * Generates Terraform configurations from infrastructure stack definitions
 */

import type { StackConfig, DatabaseConfig, StaticWebAppConfig, AppServiceConfig } from './interfaces';

export interface TerraformModule {
  provider: string;
  mainTf: string;
  variablesTf: string;
  outputsTf: string;
  terraformTfvars: string;
}

/**
 * Generate complete Terraform module from stack configuration
 */
export function generateTerraformModule(
  provider: 'azure' | 'digitalocean',
  stackConfig: StackConfig
): TerraformModule {
  switch (provider) {
    case 'azure':
      return generateAzureTerraform(stackConfig);
    case 'digitalocean':
      return generateDigitalOceanTerraform(stackConfig);
    default:
      throw new Error(`Unsupported provider: ${provider}`);
  }
}

/**
 * Generate Azure Terraform configuration
 */
function generateAzureTerraform(config: StackConfig): TerraformModule {
  const mainTf = `
terraform {
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

# Resource Group
resource "azurerm_resource_group" "main" {
  name     = var.resource_group_name
  location = var.location
  tags     = var.tags
}

${config.database ? generateAzureDatabaseTF(config.database) : ''}

${config.staticWebApp ? generateAzureStaticWebAppTF(config.staticWebApp) : ''}

${config.appService ? generateAzureAppServiceTF(config.appService) : ''}

${config.storage ? generateAzureStorageTF(config.storage.name) : ''}
  `.trim();

  const variablesTf = `
variable "resource_group_name" {
  description = "Name of the resource group"
  type        = string
  default     = "${config.resourceGroup.name}"
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "${config.resourceGroup.location}"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}

${config.database ? `
variable "db_admin_username" {
  description = "Database administrator username"
  type        = string
  default     = "${config.database.adminUsername}"
}

variable "db_admin_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}
` : ''}
  `.trim();

  const outputsTf = `
output "resource_group_id" {
  value = azurerm_resource_group.main.id
}

output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

${config.database ? `
output "database_host" {
  value = azurerm_postgresql_flexible_server.main.fqdn
}

output "database_connection_string" {
  value     = "postgresql://\${var.db_admin_username}@\${azurerm_postgresql_flexible_server.main.fqdn}:5432/postgres?sslmode=require"
  sensitive = true
}
` : ''}

${config.staticWebApp ? `
output "static_web_app_url" {
  value = azurerm_static_web_app.main.default_host_name
}
` : ''}

${config.appService ? `
output "app_service_url" {
  value = azurerm_linux_web_app.main.default_hostname
}
` : ''}
  `.trim();

  const terraformTfvars = `
resource_group_name = "${config.resourceGroup.name}"
location            = "${config.resourceGroup.location}"
${config.database ? `db_admin_password  = "CHANGEME_${config.database.adminPassword}"` : ''}
  `.trim();

  return {
    provider: 'azure',
    mainTf,
    variablesTf,
    outputsTf,
    terraformTfvars,
  };
}

function generateAzureDatabaseTF(dbConfig: DatabaseConfig & { name: string }): string {
  const sku = getTierSKU(dbConfig.tier);
  
  return `
# PostgreSQL Flexible Server
resource "azurerm_postgresql_flexible_server" "main" {
  name                   = var.db_admin_username != "" ? "${dbConfig.name}" : "${dbConfig.name}-\${random_id.db_suffix.hex}"
  resource_group_name    = azurerm_resource_group.main.name
  location               = azurerm_resource_group.main.location
  version                = "${dbConfig.version}"
  administrator_login    = var.db_admin_username
  administrator_password = var.db_admin_password
  
  storage_mb             = ${(dbConfig.storage || 32) * 1024}
  sku_name               = "${sku}"
  
  backup_retention_days  = 7
  geo_redundant_backup_enabled = false
  
  tags = var.tags
}

resource "random_id" "db_suffix" {
  byte_length = 4
}

resource "azurerm_postgresql_flexible_server_database" "main" {
  name      = "appdb"
  server_id = azurerm_postgresql_flexible_server.main.id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

# Firewall rules
resource "azurerm_postgresql_flexible_server_firewall_rule" "allow_azure" {
  name             = "allow-azure-services"
  server_id        = azurerm_postgresql_flexible_server.main.id
  start_ip_address = "0.0.0.0"
  end_ip_address   = "0.0.0.0"
}
`;
}

function generateAzureStaticWebAppTF(appConfig: StaticWebAppConfig & { name: string }): string {
  return `
# Static Web App
resource "azurerm_static_web_app" "main" {
  name                = "${appConfig.name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = "eastus2"
  sku_tier            = "Free"
  sku_size            = "Free"
  
  tags = var.tags
}
`;
}

function generateAzureAppServiceTF(appConfig: AppServiceConfig & { name: string }): string {
  const sku = getTierSKU(appConfig.tier);
  
  return `
# App Service Plan
resource "azurerm_service_plan" "main" {
  name                = "${appConfig.name}-plan"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  os_type             = "Linux"
  sku_name            = "${sku}"
  
  tags = var.tags
}

# Linux Web App
resource "azurerm_linux_web_app" "main" {
  name                = "${appConfig.name}"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  service_plan_id     = azurerm_service_plan.main.id
  
  site_config {
    application_stack {
      ${appConfig.runtime === 'node' ? `node_version = "${appConfig.runtimeVersion}"` : ''}
      ${appConfig.runtime === 'python' ? `python_version = "${appConfig.runtimeVersion}"` : ''}
    }
  }
  
  ${appConfig.environmentVariables ? `
  app_settings = {
${Object.entries(appConfig.environmentVariables).map(([key, value]) => `    "${key}" = "${value}"`).join('\n')}
  }
  ` : ''}
  
  tags = var.tags
}
`;
}

function generateAzureStorageTF(name: string): string {
  return `
# Storage Account
resource "azurerm_storage_account" "main" {
  name                     = "${name.replace(/-/g, '')}"
  resource_group_name      = azurerm_resource_group.main.name
  location                 = azurerm_resource_group.main.location
  account_tier             = "Standard"
  account_replication_type = "LRS"
  account_kind             = "StorageV2"
  
  tags = var.tags
}

resource "azurerm_storage_container" "files" {
  name                  = "files"
  storage_account_name  = azurerm_storage_account.main.name
  container_access_type = "blob"
}
`;
}

/**
 * Generate DigitalOcean Terraform configuration
 */
function generateDigitalOceanTerraform(config: StackConfig): TerraformModule {
  const mainTf = `
terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

provider "digitalocean" {
  token = var.do_token
}

# Project
resource "digitalocean_project" "main" {
  name        = var.project_name
  description = "Infrastructure for \${var.project_name}"
  purpose     = "Web Application"
  environment = "Production"
}

${config.database ? generateDODatabaseTF(config.database) : ''}

${config.staticWebApp || config.appService ? generateDOAppPlatformTF(config) : ''}

${config.storage ? generateDOSpacesTF(config.storage.name) : ''}
  `.trim();

  const variablesTf = `
variable "do_token" {
  description = "DigitalOcean API token"
  type        = string
  sensitive   = true
}

variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "${config.resourceGroup.name}"
}

variable "region" {
  description = "DigitalOcean region"
  type        = string
  default     = "${config.resourceGroup.location || 'nyc3'}"
}

${config.database ? `
variable "db_size" {
  description = "Database droplet size"
  type        = string
  default     = "db-s-1vcpu-1gb"
}
` : ''}
  `.trim();

  const outputsTf = `
output "project_id" {
  value = digitalocean_project.main.id
}

${config.database ? `
output "database_host" {
  value = digitalocean_database_cluster.main.host
}

output "database_port" {
  value = digitalocean_database_cluster.main.port
}

output "database_connection_string" {
  value     = digitalocean_database_cluster.main.uri
  sensitive = true
}
` : ''}

${config.staticWebApp || config.appService ? `
output "app_url" {
  value = digitalocean_app.main.live_url
}
` : ''}
  `.trim();

  const terraformTfvars = `
project_name = "${config.resourceGroup.name}"
region       = "${config.resourceGroup.location || 'nyc3'}"
# Set DO_TOKEN environment variable instead of storing in file
  `.trim();

  return {
    provider: 'digitalocean',
    mainTf,
    variablesTf,
    outputsTf,
    terraformTfvars,
  };
}

function generateDODatabaseTF(dbConfig: DatabaseConfig & { name: string }): string {
  return `
# Managed Database
resource "digitalocean_database_cluster" "main" {
  name       = "${dbConfig.name}"
  engine     = "${dbConfig.engine}"
  version    = "${dbConfig.version}"
  size       = var.db_size
  region     = var.region
  node_count = 1
  
  tags = ["terraform", var.project_name]
}

resource "digitalocean_database_db" "appdb" {
  cluster_id = digitalocean_database_cluster.main.id
  name       = "appdb"
}

resource "digitalocean_database_firewall" "main" {
  cluster_id = digitalocean_database_cluster.main.id
  
  rule {
    type  = "app"
    value = digitalocean_app.main.id
  }
}
`;
}

function generateDOAppPlatformTF(config: StackConfig): string {
  const hasStatic = !!config.staticWebApp;
  const hasService = !!config.appService;

  return `
# App Platform
resource "digitalocean_app" "main" {
  spec {
    name   = "${config.staticWebApp?.name || config.appService?.name}"
    region = var.region
    
    ${hasStatic ? `
    static_site {
      name          = "${config.staticWebApp!.name}"
      build_command = "${config.staticWebApp!.buildCommand}"
      output_dir    = "${config.staticWebApp!.outputDirectory}"
      
      ${config.staticWebApp!.repositoryUrl ? `
      github {
        repo   = "${config.staticWebApp!.repositoryUrl!.replace('https://github.com/', '')}"
        branch = "${config.staticWebApp!.branch || 'main'}"
      }
      ` : ''}
    }
    ` : ''}
    
    ${hasService ? `
    service {
      name               = "${config.appService!.name}"
      instance_count     = 1
      instance_size_slug = "basic-xxs"
      http_port          = 3000
      
      ${config.appService!.environmentVariables ? `
      env {
${Object.entries(config.appService!.environmentVariables!).map(([key, value]) => `
        env_variable {
          key   = "${key}"
          value = "${value}"
          scope = "RUN_AND_BUILD_TIME"
        }`).join('\n')}
      }
      ` : ''}
    }
    ` : ''}
  }
}
`;
}

function generateDOSpacesTF(name: string): string {
  return `
# Spaces (Object Storage)
resource "digitalocean_spaces_bucket" "main" {
  name   = "${name}"
  region = var.region
  acl    = "public-read"
}
`;
}

/**
 * Helper function to get tier SKU mapping
 */
function getTierSKU(tier: string): string {
  const azureSkuMap: Record<string, string> = {
    free: 'F1',
    basic: 'B1',
    standard: 'S1',
    premium: 'P1v2',
  };
  return azureSkuMap[tier] || 'B1';
}

/**
 * Generate Terraform files to disk
 */
export function writeTerraformFiles(
  module: TerraformModule,
  outputDir: string
): Record<string, string> {
  return {
    [`${outputDir}/main.tf`]: module.mainTf,
    [`${outputDir}/variables.tf`]: module.variablesTf,
    [`${outputDir}/outputs.tf`]: module.outputsTf,
    [`${outputDir}/terraform.tfvars`]: module.terraformTfvars,
    [`${outputDir}/README.md`]: generateTerraformReadme(module.provider),
  };
}

/**
 * Generate README for Terraform module
 */
function generateTerraformReadme(provider: string): string {
  return `
# Terraform Infrastructure

This directory contains Terraform configuration for deploying to ${provider}.

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) >= 1.0
- ${provider === 'azure' ? 'Azure CLI and authentication configured' : 'DigitalOcean API token'}

## Usage

\`\`\`bash
# Initialize Terraform
terraform init

# Review planned changes
terraform plan

# Apply configuration
terraform apply

# Destroy infrastructure
terraform destroy
\`\`\`

## Authentication

${provider === 'azure' ? `
Azure CLI:
\`\`\`bash
az login
\`\`\`
` : `
Set environment variable:
\`\`\`bash
export DO_TOKEN="your_digitalocean_api_token"
\`\`\`
`}

## Outputs

After successful deployment, Terraform will output:
- Resource identifiers
- Connection strings (sensitive)
- Public URLs

To view outputs:
\`\`\`bash
terraform output
terraform output -json
\`\`\`

## Customization

Edit \`terraform.tfvars\` to customize:
- Resource names
- Regions/locations
- SKUs and sizes
- Tags

See \`variables.tf\` for all available options.
`.trim();
}
