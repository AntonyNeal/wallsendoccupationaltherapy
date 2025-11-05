# DigitalOcean API PowerShell Wrapper
# Provides CLI-like commands for interacting with DigitalOcean via REST API

param(
    [Parameter(Mandatory=$true)]
    [string]$Command,
    [string]$ApiToken = $env:DO_API_TOKEN
)

$DO_API_BASE = "https://api.digitalocean.com/v2"

if (-not $DO_API_TOKEN) {
    Write-Error "Error: DO_API_TOKEN environment variable not set"
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $DO_API_TOKEN"
    "Content-Type"  = "application/json"
}

function Invoke-DOApi {
    param([string]$Endpoint, [string]$Method = "GET", [object]$Body = $null)
    
    $uri = "$DO_API_BASE$Endpoint"
    
    try {
        $params = @{
            Uri     = $uri
            Method  = $Method
            Headers = $headers
        }
        
        if ($Body) {
            $params["Body"] = $Body | ConvertTo-Json -Depth 10
        }
        
        $response = Invoke-RestMethod @params
        return $response
    }
    catch {
        Write-Error "API Error: $($_.Exception.Message)"
        exit 1
    }
}

# Parse command
$parts = $Command -split ' '
$action = $parts[0]
$resource = $parts[1]

if ($resource -eq "apps") {
    if ($action -eq "list") {
        Write-Host "📱 Listing DigitalOcean Apps..."
        $response = Invoke-DOApi -Endpoint "/apps"
        
        if ($response.apps) {
            $apps = $response.apps | Select-Object `
                @{Name="ID"; Expression={$_.id}},
                @{Name="Name"; Expression={$_.spec.name}},
                @{Name="Status"; Expression={$_.status}},
                @{Name="Created"; Expression={$_.created_at}}
            
            $apps | Format-Table -AutoSize
            Write-Host "`n✅ Found $($response.apps.Count) app(s)"
        }
    }
    elseif ($action -eq "get") {
        $appId = $parts[2]
        if (-not $appId) {
            Write-Error "Usage: do-cli apps get [app-id]"
            exit 1
        }
        
        Write-Host "🔍 Getting app details for: $appId"
        $response = Invoke-DOApi -Endpoint "/apps/$appId"
        
        if ($response.app) {
            $app = $response.app
            Write-Host "ID: $($app.id)"
            Write-Host "Name: $($app.spec.name)"
            Write-Host "Status: $($app.status)"
            Write-Host "Created: $($app.created_at)"
            Write-Host "Region: $($app.region)"
        }
    }
}

elseif ($resource -eq "databases") {
    if ($action -eq "list") {
        Write-Host "🗄️  Listing DigitalOcean Databases..."
        $response = Invoke-DOApi -Endpoint "/databases"
        
        if ($response.databases) {
            $dbs = $response.databases | Select-Object `
                @{Name="ID"; Expression={$_.id}},
                @{Name="Name"; Expression={$_.name}},
                @{Name="Engine"; Expression={$_.engine}},
                @{Name="Version"; Expression={$_.version}},
                @{Name="Status"; Expression={$_.status}},
                @{Name="Region"; Expression={$_.region}}
            
            $dbs | Format-Table -AutoSize
            Write-Host "`n✅ Found $($response.databases.Count) database(s)"
        }
    }
    elseif ($action -eq "get") {
        $dbId = $parts[2]
        if (-not $dbId) {
            Write-Error "Usage: do-cli databases get [database-id]"
            exit 1
        }
        
        Write-Host "🔍 Getting database details for: $dbId"
        $response = Invoke-DOApi -Endpoint "/databases/$dbId"
        
        if ($response.database) {
            $db = $response.database
            Write-Host "ID: $($db.id)"
            Write-Host "Name: $($db.name)"
            Write-Host "Engine: $($db.engine)"
            Write-Host "Version: $($db.version)"
            Write-Host "Status: $($db.status)"
            Write-Host "Host: $($db.connection.host)"
            Write-Host "Port: $($db.connection.port)"
            Write-Host "User: $($db.connection.user)"
            Write-Host "Database: $($db.connection.database)"
        }
    }
}

elseif ($resource -eq "functions") {
    if ($action -eq "list") {
        Write-Host "⚡ Listing DigitalOcean Functions Namespaces..."
        $response = Invoke-DOApi -Endpoint "/functions/namespaces"
        
        if ($response.namespaces) {
            $namespaces = $response.namespaces | Select-Object `
                @{Name="ID"; Expression={$_.id}},
                @{Name="Label"; Expression={$_.label}},
                @{Name="Region"; Expression={$_.region}},
                @{Name="Created"; Expression={$_.created_at}}
            
            $namespaces | Format-Table -AutoSize
            Write-Host "`n✅ Found $($response.namespaces.Count) namespace(s)"
        }
    }
}

elseif ($resource -eq "domains") {
    if ($action -eq "list") {
        Write-Host "🌐 Listing DigitalOcean Domains..."
        $response = Invoke-DOApi -Endpoint "/domains"
        
        if ($response.domains) {
            $domains = $response.domains | Select-Object `
                @{Name="Name"; Expression={$_.name}},
                @{Name="TTL"; Expression={$_.ttl}},
                @{Name="Created"; Expression={$_.created_at}}
            
            $domains | Format-Table -AutoSize
            Write-Host "`n✅ Found $($response.domains.Count) domain(s)"
        }
    }
}

elseif ($resource -eq "account") {
    if ($action -eq "get") {
        Write-Host "👤 Getting Account Information..."
        $response = Invoke-DOApi -Endpoint "/account"
        
        if ($response.account) {
            $account = $response.account
            Write-Host "Email: $($account.email)"
            Write-Host "Status: $($account.status)"
            Write-Host "Droplet Limit: $($account.droplet_limit)"
            Write-Host "Email Verified: $($account.email_verified)"
            Write-Host "Team Account: $($account.team_account)"
        }
    }
}

elseif ($resource -eq "help" -or -not $resource) {
    Write-Host @"
╔════════════════════════════════════════════════════════════════╗
║    DigitalOcean PowerShell CLI Wrapper                         ║
╚════════════════════════════════════════════════════════════════╝

SETUP:
  1. Get API token: https://cloud.digitalocean.com/account/api/tokens
  2. Set environment: `$env:DO_API_TOKEN = "your_token_here"

USAGE:
  .\do-cli.ps1 -Command "COMMAND"

COMMANDS:
  apps list                 - List all apps
  apps get APPID            - Get app details
  databases list            - List all databases
  databases get DBID        - Get database details
  functions list            - List function namespaces
  domains list              - List all domains
  account get               - Get account info

EXAMPLES:
  .\do-cli.ps1 -Command "apps list"
  .\do-cli.ps1 -Command "databases list"
  .\do-cli.ps1 -Command "account get"
"@
}

else {
    Write-Error "Unknown command: $Command"
    exit 1
}
