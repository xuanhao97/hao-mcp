#!/usr/bin/env node

/**
 * Arobid MCP Server
 *
 * MCP server that connects to Arobid Backend, allowing AI tools and editors
 * to call backend APIs in a structured way.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';

import { createArobidClient } from './client/arobidClient.js';
import { registerTools } from './server/registerTools.js';

/**
 * Main MCP server setup and initialization
 */
async function main() {
  // Initialize Arobid client
  let client;
  try {
    client = createArobidClient();
    console.error('[Arobid MCP] Client initialized successfully');
  } catch (error) {
    console.error('[Arobid MCP] Failed to initialize client:', error);
    process.exit(1);
  }

  // Create MCP server using the new high-level API
  const server = new McpServer(
    {
      name: 'arobid-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register all tools using the shared registration function
  registerTools(server, client);

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Arobid MCP] Server started and ready');
}

// Run the server
main().catch((error) => {
  console.error('[Arobid MCP] Fatal error:', error);
  process.exit(1);
});
