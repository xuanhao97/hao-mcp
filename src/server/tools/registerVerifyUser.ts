/**
 * Registration logic for the verifyUser tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { verifyUser } from '../../tools/verifyUser.js';

/**
 * Registers the verifyUser tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerVerifyUser(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'verify-account-with-otp-code',
    {
      title: 'Verify Account with OTP Code',
      description:
        'Verifies account with 6-digit OTP from email. Use after createPersonalAccount or userLogin. Required: userEmail, otp.',
      inputSchema: {
        userEmail: z.string().email().describe('User email address (must be valid email format)'),
        otp: z
          .string()
          .regex(/^\d{6}$/, {
            message: 'OTP must be exactly 6 digits',
          })
          .describe('One-time password (OTP) code - exactly 6 digits'),
      },
    },
    async (args) => {
      // Log the incoming request (mask OTP for security)
      const logArgs = { ...args };
      if (logArgs.otp) {
        logArgs.otp = '***REDACTED***';
      }
      console.error(
        `[Arobid MCP] Tool called: verifyUser\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await verifyUser(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: verifyUser\n` +
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
          `[Arobid MCP] Tool execution error: verifyUser\n` +
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

