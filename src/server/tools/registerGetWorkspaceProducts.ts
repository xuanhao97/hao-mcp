/**
 * Registration logic for the getWorkspaceProducts tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceProducts } from '../../tools/getWorkspaceProducts.js';

const productsFilters = {
  businessId: z.number().int().positive().optional().describe('BusinessId query parameter'),
  eventId: z.number().int().positive().optional().describe('EventId query parameter'),
  search: z.string().optional().describe('Search keyword'),
  isRegisted: z.boolean().optional().describe('Filter by registration status'),
  pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
  pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
  filter: z.string().optional().describe('Filter expression'),
  skip: z.number().int().nonnegative().optional().describe('Records to skip'),
  sortField: z.string().optional().describe('Field to sort by'),
  asc: z.boolean().optional().describe('Sort ascending flag'),
};

export function registerGetWorkspaceProducts(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getWorkspaceProducts',
    {
      title: 'Get Workspace Products',
      description: 'Retrieves products.',
      inputSchema: {
        ...productsFilters,
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
      console.error('[Arobid MCP] Tool called: getWorkspaceProducts', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceProducts(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceProducts (${Date.now() - start}ms)`
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
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getWorkspaceProducts (${Date.now() - start}ms): ${message}`
        );
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: message }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}


