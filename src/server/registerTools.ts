/**
 * Shared module for registering MCP tools
 * This allows the same tool registration logic to be reused between
 * stdio transport (src/index.ts) and HTTP transport (api/mcp/route.ts)
 *
 * This module acts as a central registry that imports and calls
 * individual tool registration functions from the tools/ directory.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ArobidClient } from '../client/arobidClient.js';
import { registerCreatePersonalAccount } from './tools/registerCreatePersonalAccount.js';
import { registerVerifyUser } from './tools/registerVerifyUser.js';
import { registerUserLogin } from './tools/registerUserLogin.js';
import { registerResendOtp } from './tools/registerResendOtp.js';
import { registerCheckResetPassword } from './tools/registerCheckResetPassword.js';
import { registerConfirmResetPassword } from './tools/registerConfirmResetPassword.js';

/**
 * Registers all MCP tools on the given server instance
 * @param server - The MCP server instance to register tools on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerTools(server: McpServer, client: ArobidClient): void {
  // Register all available tools
  registerCreatePersonalAccount(server, client);
  registerVerifyUser(server, client);
  registerUserLogin(server, client);
  registerResendOtp(server, client);
  registerCheckResetPassword(server, client);
  registerConfirmResetPassword(server, client);
}

