#!/usr/bin/env node

/**
 * Arobid MCP Server
 * 
 * MCP server that connects to Arobid Backend, allowing AI tools and editors
 * to call backend APIs in a structured way.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import * as z from 'zod';

import { createArobidClient } from './client/arobidClient.js';
import { createPersonalAccount } from './tools/createPersonalAccount.js';
import { verifyUser } from './tools/verifyUser.js';

/**
 * Main MCP server setup and initialization
 */
async function main() {
  // Initialize Arobid client
  let client;
  try {
    client = createArobidClient();
    console.error('[Arobid MCP] Client initialized successfully');
  } catch (error) {
    console.error('[Arobid MCP] Failed to initialize client:', error);
    process.exit(1);
  }

  // Create MCP server using the new high-level API
  const server = new McpServer(
    {
      name: 'arobid-mcp',
      version: '1.0.0',
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  // Register the createPersonalAccount tool
  server.registerTool(
    'createPersonalAccount',
    {
      title: 'Create Personal Account',
      description:
        'Creates a new personal user account in Arobid Backend. Requires email, password, firstName, lastName, title, phone, and national.',
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
        title: z
          .enum(['Mr', 'Mrs'])
          .describe('User title (Mr or Mrs)'),
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
              message: 'Phone must be a valid Vietnamese phone (+84XXXXXXXXX or 0XXXXXXXXX) or international format (+XXXXXXXXXXX)',
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
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';
        
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

  // Register the verifyUser tool
  server.registerTool(
    'verifyUser',
    {
      title: 'Verify User Account',
      description:
        'Verifies a user account in Arobid Backend using the OTP code sent to the user email. Requires userEmail and otp.',
      inputSchema: {
        userEmail: z
          .string()
          .email()
          .describe('User email address (must be valid email format)'),
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
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred';

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

  // Start server with stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);

  console.error('[Arobid MCP] Server started and ready');
}

// Run the server
main().catch((error) => {
  console.error('[Arobid MCP] Fatal error:', error);
  process.exit(1);
});

