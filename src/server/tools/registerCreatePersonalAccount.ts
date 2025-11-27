/**
 * Registration logic for the createPersonalAccount tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { createPersonalAccount } from '../../tools/createPersonalAccount.js';

/**
 * Registers the createPersonalAccount tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerCreatePersonalAccount(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'createPersonalAccount',
    {
      title: 'Register New User Account',
      description:
        'Creates a new personal user account in the Arobid platform. This is the first step in the account creation workflow. ' +
        'After successful registration, an OTP code will be sent to the user\'s email address. ' +
        'You must then use the verifyUser tool with the OTP code to complete account verification. ' +
        'If the OTP expires, use resendOtp or userLogin to get a new OTP code. ' +
        'Required fields: email (valid format), password (6-20 chars with uppercase, lowercase, numbers, special chars), firstName, lastName, title (Mr/Mrs), phone (Vietnamese or international format), and national (2-letter country code like VN, US).',
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
            'User password (6-20 characters, must include lowercase, uppercase, numbers, and special characters)'
          ),
        firstName: z.string().min(1).describe('User first name'),
        lastName: z.string().min(1).describe('User last name'),
        title: z.enum(['Mr', 'Mrs']).describe('User title (Mr or Mrs)'),
        phone: z
          .string()
          .refine(
            (val) => {
              // Vietnamese phone regex: +84 or 0 followed by 9-10 digits
              const vnPhoneRegex = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
              // International phone regex (basic): + followed by country code and digits
              const intlPhoneRegex = /^\+[1-9]\d{1,14}$/;
              return vnPhoneRegex.test(val) || intlPhoneRegex.test(val);
            },
            {
              message:
                'Phone must be a valid Vietnamese phone (+84XXXXXXXXX or 0XXXXXXXXX) or international format (+XXXXXXXXXXX)',
            }
          )
          .describe('User phone number (Vietnamese or international format)'),
        national: z
          .string()
          .regex(/^[A-Z]{2}$/i, {
            message: 'National must be a 2-letter country code (e.g., VN, US, AF)',
          })
          .transform((val) => val.toUpperCase())
          .describe('User nationality code (2-letter uppercase country code, e.g., VN, US, AF)'),
      },
    },
    async (args) => {
      // Log the incoming request (mask password for security)
      const logArgs = { ...args };
      if (logArgs.password) {
        logArgs.password = '***REDACTED***';
      }
      console.error(
        `[Arobid MCP] Tool called: createPersonalAccount\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(logArgs, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await createPersonalAccount(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: createPersonalAccount\n` +
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
          `[Arobid MCP] Tool execution error: createPersonalAccount\n` +
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

