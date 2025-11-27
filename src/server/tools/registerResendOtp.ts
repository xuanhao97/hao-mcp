/**
 * Registration logic for the resendOtp tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { resendOtp } from '../../tools/resendOtp.js';

/**
 * Registers the resendOtp tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerResendOtp(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'request-new-otp-code',
    {
      title: 'Request New OTP Code',
      description:
        'Sends a new OTP (One-Time Password) code to the user\'s email address. ' +
        'Use this tool when: (1) The previous OTP has expired, (2) verifyUser fails with an invalid/expired OTP error, or (3) The user didn\'t receive the original OTP email. ' +
        'This is the preferred method for getting a new OTP when you don\'t have the user\'s password. If you have the password, you can alternatively use userLogin which also sends a new OTP. ' +
        'After calling this tool, a new 6-digit OTP will be sent to the user\'s email. Wait a moment for the email to arrive, then use verifyUser with the new OTP code. ' +
        'Required: userEmail (the email address where the OTP should be sent).',
      inputSchema: {
        userEmail: z.string().email().describe('User email address (must be valid email format)'),
      },
    },
    async (args) => {
      // Log the incoming request
      console.error(
        `[Arobid MCP] Tool called: resendOtp\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(args, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await resendOtp(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: resendOtp\n` +
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
          `[Arobid MCP] Tool execution error: resendOtp\n` +
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

