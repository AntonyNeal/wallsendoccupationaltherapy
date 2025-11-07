# DigitalOcean MCP Integration Setup Guide

## What is MCP?

The Model Context Protocol (MCP) allows AI tools like GitHub Copilot to interact with external services. This integration lets you manage your DigitalOcean infrastructure directly through Copilot chat.

## Quick Setup

### Step 1: Set Your API Token

1. Get your DigitalOcean API token from: https://cloud.digitalocean.com/account/api/tokens
   - Click "Generate New Token"
   - Name it: `copilot-mcp-token`
   - Enable both **Read** and **Write** scopes
   - Copy the token (shown only once)

2. Set it as an environment variable:

**Windows PowerShell (Permanent):**

```powershell
[System.Environment]::SetEnvironmentVariable('DO_API_TOKEN', 'your_token_here', 'User')
```

**Windows PowerShell (Temporary):**

```powershell
$env:DO_API_TOKEN = "your_token_here"
```

3. Restart VS Code to pick up the new environment variable

### Step 2: Verify Installation

The MCP server has been set up in `mcp-server/` with the following:

- ✅ MCP SDK installed
- ✅ Server implementation created (`index.js`)
- ✅ VS Code settings configured (`.vscode/settings.json`)

### Step 3: Test the Integration

1. Restart VS Code completely (close all windows)
2. Open this workspace again
3. Open GitHub Copilot Chat
4. Try these commands:

```
@workspace List my DigitalOcean apps
```

```
@workspace Show my DigitalOcean account info
```

```
@workspace List my databases
```

## Available Commands

Once configured, you can ask Copilot to:

### App Management

- "List my DigitalOcean apps"
- "Show details for app [app-id]"
- "What's the status of my apps?"

### Database Management

- "List my databases"
- "Get connection details for database [db-id]"
- "Show all PostgreSQL databases"

### Droplet Management

- "List my droplets"
- "Show details for droplet [droplet-id]"
- "What VMs are running?"

### SSH Key Management

- "List my SSH keys"
- "Add SSH key named [name] with public key [key]"

### Domain Management

- "List my domains"
- "What domains do I have?"

### Functions

- "List my function namespaces"
- "Show my serverless functions"

### Account

- "Show my DigitalOcean account info"
- "What's my droplet limit?"

## How It Works

1. **MCP Server** (`mcp-server/index.js`):
   - Wraps DigitalOcean API calls
   - Exposes them as tools to Copilot
   - Runs as a stdio server

2. **VS Code Configuration** (`.vscode/settings.json`):
   - Registers the MCP server with Copilot
   - Passes your API token securely

3. **GitHub Copilot**:
   - Detects available MCP tools
   - Calls them when you ask questions
   - Returns formatted results

## Architecture

```
You ask a question in Copilot Chat
         ↓
GitHub Copilot understands the intent
         ↓
Copilot calls MCP tool (e.g., "list_apps")
         ↓
MCP Server makes DigitalOcean API request
         ↓
Results returned to Copilot
         ↓
Copilot formats and shows you the answer
```

## Troubleshooting

### "MCP server not found" or no tools available

**Solution:**

1. Make sure `DO_API_TOKEN` is set in your environment
2. Restart VS Code completely
3. Check VS Code Developer Console (Help → Toggle Developer Tools)
4. Look for MCP-related errors

### "Unauthorized" or "401" errors

**Solution:**

1. Verify your API token is correct
2. Make sure the token has Read + Write permissions
3. Generate a new token if needed
4. Update the environment variable

### MCP server crashes

**Solution:**

1. Check the MCP server logs in VS Code Developer Console
2. Verify Node.js version: `node --version` (needs >=20.0.0)
3. Test the server manually:
   ```powershell
   cd mcp-server
   $env:DO_API_TOKEN = "your_token"
   node index.js
   ```

### Commands not working in Copilot

**Solution:**

1. Make sure to use `@workspace` prefix
2. Try being more specific: "List my DigitalOcean apps" instead of "show apps"
3. Restart Copilot Chat
4. Reload VS Code window (Ctrl+Shift+P → "Reload Window")

## Manual Testing

You can test the MCP server directly:

```powershell
cd mcp-server
$env:DO_API_TOKEN = "your_token_here"
node index.js
```

Then interact with it using stdio (it will read JSON-RPC messages).

## Security Notes

⚠️ **Important:**

- Never commit `.env` files with tokens to git
- The `.env.example` is for reference only
- API token is passed via environment variables
- Keep your token secret and rotate it regularly

## Next Steps

Once the MCP integration is working:

1. **Explore your infrastructure:**

   ```
   @workspace List all my DigitalOcean resources
   ```

2. **Deploy your booking backend:**

   ```
   @workspace Help me deploy the booking API to DigitalOcean Functions
   ```

3. **Manage databases:**

   ```
   @workspace Show my database connection details
   ```

4. **Automate workflows:**
   Ask Copilot to help you create deployment scripts using MCP tools

## What You Can Do Now

With the DigitalOcean MCP integration, you can:

✅ Check app status without leaving VS Code
✅ Get database connection strings instantly
✅ Monitor droplets and resources
✅ Add SSH keys programmatically
✅ Query domains and DNS settings
✅ Manage serverless functions

All through natural language in GitHub Copilot Chat!

## Example Workflow

**Scenario: Deploy the booking backend**

1. You: "@workspace What databases do I have?"
2. Copilot uses MCP → shows your PostgreSQL database
3. You: "@workspace Get connection details for that database"
4. Copilot uses MCP → returns host, port, credentials
5. You: "@workspace Update my booking API with these credentials"
6. Copilot updates your code with the correct connection string

## Resources

- [MCP Documentation](https://modelcontextprotocol.io/)
- [DigitalOcean API Docs](https://docs.digitalocean.com/reference/api/)
- [GitHub Copilot MCP Support](https://github.com/features/copilot)

---

**Setup Complete!** 🎉

Restart VS Code and try asking Copilot about your DigitalOcean resources.
