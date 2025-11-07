# DigitalOcean MCP - Quick Reference

## Setup (One-time)

1. **Get API Token**: https://cloud.digitalocean.com/account/api/tokens
2. **Set Environment Variable**:
   ```powershell
   [System.Environment]::SetEnvironmentVariable('DO_API_TOKEN', 'your_token', 'User')
   ```
3. **Restart VS Code**

## Usage

All commands start with `@workspace` in Copilot Chat:

```
@workspace [your question about DigitalOcean]
```

## Common Commands

| What you want      | What to ask                                               |
| ------------------ | --------------------------------------------------------- |
| See all apps       | `List my DigitalOcean apps`                               |
| App details        | `Show details for app [app-id]`                           |
| All databases      | `List my databases`                                       |
| DB connection info | `Get connection details for database [db-id]`             |
| All droplets       | `List my droplets`                                        |
| Droplet details    | `Show droplet [droplet-id]`                               |
| SSH keys           | `List my SSH keys`                                        |
| Add SSH key        | `Add SSH key named "mykey" with public key [key-content]` |
| Domains            | `List my domains`                                         |
| Functions          | `List my function namespaces`                             |
| Account info       | `Show my DigitalOcean account info`                       |

## Available MCP Tools

The following tools are available through the MCP server:

- `list_apps` - List all App Platform apps
- `get_app` - Get app details by ID
- `list_databases` - List all managed databases
- `get_database` - Get database details by ID
- `list_droplets` - List all Droplets (VMs)
- `get_droplet` - Get Droplet details by ID
- `add_ssh_key` - Add an SSH public key
- `list_ssh_keys` - List all SSH keys
- `list_domains` - List all domains
- `list_functions_namespaces` - List Functions namespaces
- `get_account` - Get account information

## Troubleshooting

| Problem             | Solution                              |
| ------------------- | ------------------------------------- |
| Tools not showing   | Restart VS Code completely            |
| Unauthorized error  | Check `DO_API_TOKEN` is set correctly |
| Server not starting | Verify Node.js >= 20.0.0              |
| Commands ignored    | Use `@workspace` prefix               |

## Test Commands

After setup, try:

```
@workspace Show my DigitalOcean account info
@workspace List my apps
@workspace How many databases do I have?
```

## File Locations

- MCP Server: `mcp-server/index.js`
- Configuration: `.vscode/settings.json`
- Full Guide: `mcp-server/README.md`

---

**Need help?** See `mcp-server/README.md` for detailed documentation.
