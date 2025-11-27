/**
 * Registration logic for the confirmResetPassword tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { confirmResetPassword } from '../../tools/confirmResetPassword.js';

/**
 * Registers the confirmResetPassword tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerConfirmResetPassword(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'complete-password-reset-with-otp',
    {
      title: 'Complete Password Reset with OTP',
      description:
        'Finalizes the password reset or password change process by validating the OTP code and setting the new password. ' +
        'This tool must be used after checkResetPassword has been called and the OTP code has been sent to the user\'s email. ' +
        'The workflow is: (1) Call checkResetPassword with user email, (2) User receives OTP in email, (3) Call this tool with email, new password, and OTP to complete. ' +
        'The new password must be 6-20 characters and include: at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&). ' +
        'The OTP must be exactly 6 digits as received in the email. ' +
        'Required: email (user\'s email address), password (new password meeting complexity requirements), and otp (6-digit code from email).',
      inputSchema: {
        email: z.string().email().describe('User email address (must be valid email format)'),
        password: z
          .string()
          .min(6)
          .max(20)
          .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,20}$/, {
            message:
              'Password must be 6-20 characters and include lowercase, uppercase, numbers, and special characters',
          })
          .describe(
            'New password (6-20 characters, must include lowercase, uppercase, numbers, and special characters)'
          ),
        otp: z
          .string()
          .regex(/^\d{6}$/, {
            message: 'OTP must be exactly 6 digits',
          })
          .describe('One-time password (OTP) code - exactly 6 digits'),
      },
    },
    async (args) => {
      // Log the incoming request (mask password and OTP for security)
      const logArgs = { ...args };
      if (logArgs.password) {
        logArgs.password = '***REDACTED***';
      }
      if (logArgs.otp) {
        logArgs.otp = '***REDACTED***';
      }
      console.error(
        `[Arobid MCP] Tool called: confirmResetPassword\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await confirmResetPassword(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: confirmResetPassword\n` +
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
          `[Arobid MCP] Tool execution error: confirmResetPassword\n` +
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

