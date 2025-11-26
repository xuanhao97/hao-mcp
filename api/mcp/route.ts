/**
 * Vercel API route handler for MCP server
 * This allows the MCP server to be deployed on Vercel and accessed via HTTP
 */

import { createMcpHandler } from 'mcp-handler';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createArobidClient, ArobidClient } from '../../src/client/arobidClient.js';
import { registerTools } from '../../src/server/registerTools.js';

// Initialize Arobid client
let client: ArobidClient | undefined;
try {
  client = createArobidClient();
} catch (error) {
  console.error('[Arobid MCP] Failed to initialize client:', error);
  // We'll throw an error when the handler is called if client is not initialized
}

// Create the MCP handler using mcp-handler
const handler = createMcpHandler(
  async (server: McpServer) => {
    if (!client) {
      throw new Error(
        'Arobid client not initialized. Please set AROBID_BACKEND_URL environment variable.'
      );
    }

    // Register all tools using the shared registration function
    registerTools(server, client);
  },
  {
    serverInfo: {
      name: 'arobid-mcp',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
    },
  },
  { basePath: '/api' }
);

// Export handlers for GET, POST, and DELETE methods
export { handler as GET, handler as POST, handler as DELETE };

