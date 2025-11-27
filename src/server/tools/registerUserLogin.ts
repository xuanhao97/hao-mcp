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
    'userLogin',
    {
      title: 'Authenticate User and Request OTP',
      description:
        'Authenticates a user with their email and password credentials. After successful login, a new OTP code is automatically sent to the user\'s email. ' +
        'Use this tool when: (1) User needs to log in to their account, (2) Previous OTP has expired and you need a fresh one for verification, or (3) As an alternative to resendOtp when you have the user\'s password. ' +
        'Important: If the response contains errorCode 5, this indicates the OTP was sent successfully - proceed to verifyUser with the OTP code from the email. ' +
        'This tool requires the user\'s email and password. After calling this tool, check the user\'s email for the OTP code and use verifyUser to complete authentication.',
      inputSchema: {
        email: z.string().email().describe('User email address (must be valid email format)'),
        password: z
          .string()
          .min(1)
          .describe('User password'),
      },
    },
    async (args) => {
      // Log the incoming request (mask password for security)
      const logArgs = { ...args };
      if (logArgs.password) {
        logArgs.password = '***REDACTED***';
      }
      console.error(
        `[Arobid MCP] Tool called: userLogin\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await userLogin(client, args);
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

