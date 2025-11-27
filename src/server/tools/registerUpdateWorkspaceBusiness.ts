/**
 * Registration logic for the updateWorkspaceBusiness tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { updateWorkspaceBusiness } from '../../tools/updateWorkspaceBusiness.js';

const fileModelSchema = z
  .object({
    toggle: z.boolean().optional(),
    url: z.array(z.string()).optional(),
    type: z.string().optional(),
  })
  .strict();

export function registerUpdateWorkspaceBusiness(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'updateWorkspaceBusiness',
    {
      title: 'Update Workspace Business',
      description:
        'Updates business profile fields via /tradexpo/api/workspace/update-business.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID'),
        expoBusinessId: z.number().int().positive().describe('Expo business ID'),
        video: fileModelSchema.optional().describe('Video file metadata'),
        banner: fileModelSchema.optional().describe('Banner file metadata'),
        description: z.string().optional().describe('Business description'),
        supervisorName: z.string().optional().describe('Supervisor name'),
        supervisorPhone: z.string().optional().describe('Supervisor phone'),
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
      console.error('[Arobid MCP] Tool called: updateWorkspaceBusiness', args);
      const start = Date.now();

      try {
        const result = await updateWorkspaceBusiness(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: updateWorkspaceBusiness (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: updateWorkspaceBusiness (${Date.now() - start}ms): ${message}`
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


