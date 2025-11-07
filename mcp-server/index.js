#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

const DO_API_BASE = 'https://api.digitalocean.com/v2';
const DO_API_TOKEN = process.env.DO_API_TOKEN;

if (!DO_API_TOKEN) {
  console.error('Error: DO_API_TOKEN environment variable not set');
  process.exit(1);
}

const headers = {
  Authorization: `Bearer ${DO_API_TOKEN}`,
  'Content-Type': 'application/json',
};

// Create MCP server
const server = new Server(
  {
    name: 'digitalocean-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// Helper function for API calls
async function callDOApi(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${DO_API_BASE}${endpoint}`,
      headers,
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    throw new Error(`DigitalOcean API Error: ${error.response?.data?.message || error.message}`);
  }
}

// Define available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'list_apps',
        description: 'List all DigitalOcean App Platform apps in your account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_app',
        description: 'Get details for a specific DigitalOcean App Platform app',
        inputSchema: {
          type: 'object',
          properties: {
            app_id: {
              type: 'string',
              description: 'The ID of the app to retrieve',
            },
          },
          required: ['app_id'],
        },
      },
      {
        name: 'list_databases',
        description: 'List all managed databases in your DigitalOcean account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_database',
        description: 'Get details for a specific database cluster',
        inputSchema: {
          type: 'object',
          properties: {
            database_id: {
              type: 'string',
              description: 'The ID of the database cluster',
            },
          },
          required: ['database_id'],
        },
      },
      {
        name: 'list_functions_namespaces',
        description: 'List all DigitalOcean Functions namespaces',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_domains',
        description: 'List all domains in your DigitalOcean account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_account',
        description: 'Get your DigitalOcean account information',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'list_droplets',
        description: 'List all Droplets (VMs) in your account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
      {
        name: 'get_droplet',
        description: 'Get details for a specific Droplet',
        inputSchema: {
          type: 'object',
          properties: {
            droplet_id: {
              type: 'string',
              description: 'The ID of the Droplet',
            },
          },
          required: ['droplet_id'],
        },
      },
      {
        name: 'add_ssh_key',
        description: 'Add an SSH public key to your DigitalOcean account',
        inputSchema: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'The name to identify this SSH key',
            },
            public_key: {
              type: 'string',
              description: 'The full SSH public key string',
            },
          },
          required: ['name', 'public_key'],
        },
      },
      {
        name: 'list_ssh_keys',
        description: 'List all SSH keys in your DigitalOcean account',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

// Handle tool execution
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    let result;

    switch (name) {
      case 'list_apps': {
        const data = await callDOApi('/apps');
        result = {
          apps: data.apps || [],
          count: data.apps?.length || 0,
        };
        break;
      }

      case 'get_app': {
        const data = await callDOApi(`/apps/${args.app_id}`);
        result = data.app;
        break;
      }

      case 'list_databases': {
        const data = await callDOApi('/databases');
        result = {
          databases: data.databases || [],
          count: data.databases?.length || 0,
        };
        break;
      }

      case 'get_database': {
        const data = await callDOApi(`/databases/${args.database_id}`);
        result = data.database;
        break;
      }

      case 'list_functions_namespaces': {
        const data = await callDOApi('/functions/namespaces');
        result = {
          namespaces: data.namespaces || [],
          count: data.namespaces?.length || 0,
        };
        break;
      }

      case 'list_domains': {
        const data = await callDOApi('/domains');
        result = {
          domains: data.domains || [],
          count: data.domains?.length || 0,
        };
        break;
      }

      case 'get_account': {
        const data = await callDOApi('/account');
        result = data.account;
        break;
      }

      case 'list_droplets': {
        const data = await callDOApi('/droplets');
        result = {
          droplets: data.droplets || [],
          count: data.droplets?.length || 0,
        };
        break;
      }

      case 'get_droplet': {
        const data = await callDOApi(`/droplets/${args.droplet_id}`);
        result = data.droplet;
        break;
      }

      case 'add_ssh_key': {
        const data = await callDOApi('/account/keys', 'POST', {
          name: args.name,
          public_key: args.public_key,
        });
        result = {
          success: true,
          ssh_key: data.ssh_key,
          message: `SSH key "${args.name}" added successfully`,
        };
        break;
      }

      case 'list_ssh_keys': {
        const data = await callDOApi('/account/keys');
        result = {
          ssh_keys: data.ssh_keys || [],
          count: data.ssh_keys?.length || 0,
        };
        break;
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('DigitalOcean MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
