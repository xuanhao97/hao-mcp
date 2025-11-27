/**
 * Registration logic for the deleteWorkspaceProduct tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { deleteWorkspaceProduct } from '../../tools/deleteWorkspaceProduct.js';

export function registerDeleteWorkspaceProduct(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'deleteWorkspaceProduct',
    {
      title: 'Delete Workspace Product',
      description:
        'Deletes a workspace product.',
      inputSchema: {
        id: z.number().int().positive().describe('Product subscription ID (path parameter)'),
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
      console.error('[Arobid MCP] Tool called: deleteWorkspaceProduct', args);
      const start = Date.now();

      try {
        const result = await deleteWorkspaceProduct(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: deleteWorkspaceProduct (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: deleteWorkspaceProduct (${Date.now() - start}ms): ${message}`
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


