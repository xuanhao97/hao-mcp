/**
 * Vercel API route handler for MCP server
 * This allows the MCP server to be deployed on Vercel and accessed via HTTP
 * 
 * Supports environment variables via:
 * 1. Request headers (X-Arobid-Backend-Url, X-Arobid-Api-Key, X-Arobid-Tenant-Id)
 * 2. process.env (AROBID_BACKEND_URL, AROBID_API_KEY, AROBID_TENANT_ID)
 */

import { createMcpHandler } from 'mcp-handler';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { createArobidClient, extractConfigFromHeaders, ArobidClient } from '../../src/client/arobidClient.js';
import { registerTools } from '../../src/server/registerTools.js';

// Try to initialize a default client from process.env (for backward compatibility)
let defaultClient: ArobidClient | undefined;
try {
  defaultClient = createArobidClient();
} catch (error) {
  console.error('[Arobid MCP] Failed to initialize default client from process.env:', error);
  // This is okay - we'll create clients per-request from headers if needed
}

/**
 * Creates or retrieves the Arobid client for a given request
 * Extracts configuration from headers, falling back to process.env
 */
function getClientForRequest(request: Request): ArobidClient {
  // Extract configuration from request headers
  const headerConfig = extractConfigFromHeaders(request.headers);
  
  // Create client from headers (if provided) or fall back to default client
  try {
    if (Object.keys(headerConfig).length > 0) {
      // Use header config, falling back to process.env for missing values
      return createArobidClient(headerConfig);
    } else if (defaultClient) {
      // Use default client from process.env
      return defaultClient;
    } else {
      throw new Error(
        'Arobid client not initialized. Please provide configuration via headers (X-Arobid-Backend-Url, etc.) or set AROBID_BACKEND_URL environment variable.'
      );
    }
  } catch (error) {
    console.error('[Arobid MCP] Failed to create client:', error);
    throw error;
  }
}

/**
 * Creates an MCP handler with a specific client instance
 */
function createHandlerWithClient(client: ArobidClient) {
  return createMcpHandler(
    async (server: McpServer) => {
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
}

/**
 * Handles a request by creating a client from headers and creating a handler
 */
async function handleRequest(request: Request) {
  // Get client for this request (from headers or process.env)
  const client = getClientForRequest(request);
  
  // Create a handler with this specific client
  const handler = createHandlerWithClient(client);
  
  // Call the handler with the request
  return handler(request);
}

// Export handlers for GET, POST, and DELETE methods
export async function GET(request: Request) {
  return handleRequest(request);
}

export async function POST(request: Request) {
  return handleRequest(request);
}

export async function DELETE(request: Request) {
  return handleRequest(request);
}

