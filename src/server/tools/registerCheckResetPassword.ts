/**
 * Registration logic for the checkResetPassword tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { checkResetPassword } from '../../tools/checkResetPassword.js';

/**
 * Registers the checkResetPassword tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerCheckResetPassword(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'checkResetPassword',
    {
      title: 'Check Reset Password / Change Password',
      description:
        'Initiates password reset or change password process in Arobid Backend. This will send a reset link or OTP to the user\'s email. ' +
        'Use this tool for both scenarios: (1) Password reset when user forgot their password, or (2) Change password when user wants to update their existing password. ' +
        'After calling this tool, an OTP will be sent to the user\'s email. Use confirmResetPassword to complete the process with the new password and OTP. Requires email.',
      inputSchema: {
        email: z.string().email().describe('User email address (must be valid email format)'),
      },
    },
    async (args) => {
      // Log the incoming request
      console.error(
        `[Arobid MCP] Tool called: checkResetPassword\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(args, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await checkResetPassword(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: checkResetPassword\n` +
            `[Arobid MCP] Duration: ${duration}ms\n` +
            `[Arobid MCP] Result: ${JSON.stringify(result, null, 2)}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const duration = Date.now() - startTime;
        // Convert errors to MCP-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        console.error(
          `[Arobid MCP] Tool execution error: checkResetPassword\n` +
            `[Arobid MCP] Duration: ${duration}ms\n` +
            `[Arobid MCP] Error: ${errorMessage}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}

