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
    'initiate-password-reset-or-change',
    {
      title: 'Initiate Password Reset or Change',
      description:
        'Starts the password reset or password change workflow by sending an OTP code to the user\'s email address. ' +
        'This single tool handles two use cases: (1) Password Reset - when a user has forgotten their password and needs to reset it, or (2) Change Password - when a user wants to update their existing password for security reasons. ' +
        'After calling this tool, a 6-digit OTP code will be sent to the user\'s email. ' +
        'Next step: Wait for the user to receive the OTP, then use confirmResetPassword with the email, new password, and OTP code to complete the process. ' +
        'The new password must meet complexity requirements: 6-20 characters with at least one uppercase letter, one lowercase letter, one number, and one special character. ' +
        'Required: email (the user\'s email address).',
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

