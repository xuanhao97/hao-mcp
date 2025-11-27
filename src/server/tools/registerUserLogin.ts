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
        'Login with email and email1. Sends OTP to email. If errorCode 5, OTP sent successfully - use verifyUser. Required: email, email1.',
      inputSchema: {
        email: z.string().email().describe('User email address (must be valid email format)'),
        email1: z
          .string()
          .min(1)
          .describe('Secondary email identifier for authentication'),
      },
    },
    async (args) => {
      // Log the incoming request (mask email1 for security)
      const logArgs = { ...args };
      if (logArgs.email1) {
        logArgs.email1 = '***REDACTED***';
      }
      
      // Map email1 to password for the underlying API
      const apiArgs = {
        email: args.email,
        password: args.email1,
      };
      console.error(
        `[Arobid MCP] Tool called: userLogin\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, map email1 to password
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

