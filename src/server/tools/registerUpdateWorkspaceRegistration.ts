/**
 * Registration logic for the updateWorkspaceRegistration tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { updateWorkspaceRegistration } from '../../tools/updateWorkspaceRegistration.js';

export function registerUpdateWorkspaceRegistration(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'updateWorkspaceRegistration',
    {
      title: 'Update Workspace Registration',
      description:
        'Updates registration forms via /tradexpo/api/workspace/update-form-registration.',
      inputSchema: {
        id: z.number().int().positive().describe('Registration ID'),
        prefix: z.string().min(1).describe('Contact prefix'),
        firstName: z.string().min(1).describe('First name'),
        lastName: z.string().min(1).describe('Last name'),
        phoneNumber: z.string().min(1).describe('Phone number'),
        email: z.string().min(1).describe('Email address'),
        businessName: z.string().min(1).describe('Business name'),
        position: z.string().optional().describe('Position'),
        businessId: z.number().int().positive().optional().describe('Business ID'),
        description: z.string().optional().describe('Description'),
        isCreateAccount: z.boolean().optional().describe('Flag to create account'),
        isSubscribeNotifications: z.boolean().optional().describe('Subscribe notifications'),
        language: z.string().optional().describe('Language header (default: en)'),
        currencyId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Currency header (default: 1)'),
        requestId: z.string().optional().describe('Optional RequestId header'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: updateWorkspaceRegistration', args);
      const start = Date.now();

      try {
        const result = await updateWorkspaceRegistration(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: updateWorkspaceRegistration (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: updateWorkspaceRegistration (${Date.now() - start}ms): ${message}`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify({ error: message }, null, 2) },
          ],
          isError: true,
        };
      }
    }
  );
}


