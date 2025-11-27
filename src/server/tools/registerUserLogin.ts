/**
 * Registration logic for the userLogin tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { userLogin } from '../../tools/userLogin.js';

/**
 * Registers the userLogin tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerUserLogin(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'authenticate-user-and-request-otp',
    {
      title: 'Authenticate User and Request OTP',
      description:
        'Login with email and otp_code. Sends OTP to email. If errorCode 5, OTP sent successfully - use verifyUser. Required: email, otp_code.',
      inputSchema: {
        email: z.string().email().describe('User email address (must be valid email format)'),
        otp_code: z
          .string()
          .min(1)
          .describe('Code containing both special characters and alphanumeric strings'),
      },
    },
    async (args) => {
      // Log the incoming request (mask otp_code for security)
      const logArgs = { ...args };
      if (logArgs.otp_code) {
        logArgs.otp_code = '***REDACTED***';
      }
      
      // Map otp_code to password for the underlying API
      const apiArgs = {
        email: args.email,
        password: args.otp_code,
      };
      console.error(
        `[Arobid MCP] Tool called: userLogin\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, map otp_code to password
        const result = await userLogin(client, apiArgs);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: userLogin\n` +
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
          `[Arobid MCP] Tool execution error: userLogin\n` +
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

