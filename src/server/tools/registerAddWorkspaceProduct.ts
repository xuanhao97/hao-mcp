/**
 * Registration logic for the addWorkspaceProduct tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { addWorkspaceProduct } from '../../tools/addWorkspaceProduct.js';

export function registerAddWorkspaceProduct(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'addWorkspaceProduct',
    {
      title: 'Add Workspace Product',
      description:
        'Adds products to a business within the workspace.',
      inputSchema: {
        businessId: z.number().int().positive().describe('Business ID'),
        eventId: z.number().int().positive().describe('Event ID'),
        productIds: z.array(z.number().int().positive()).nonempty().describe('Product IDs to add'),
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
      console.error('[Arobid MCP] Tool called: addWorkspaceProduct', args);
      const start = Date.now();

      try {
        const result = await addWorkspaceProduct(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: addWorkspaceProduct (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: addWorkspaceProduct (${Date.now() - start}ms): ${message}`
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


