/**
 * Registration logic for the getBusinessProducts tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getBusinessProducts } from '../../tools/getBusinessProducts.js';

export function registerGetBusinessProducts(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getBusinessProducts',
    {
      title: 'Get Business Products',
      description:
        'Retrieves the product list of a specific business within an event using tradexpo pagination.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event (id path parameter)'),
        businessId: z.number().int().positive().describe('BusinessId path parameter'),
        pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
        pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
        filter: z.string().optional().describe('Filter expression'),
        skip: z.number().int().nonnegative().optional().describe('Records to skip'),
        sortField: z.string().optional().describe('Field to sort by'),
        asc: z.boolean().optional().describe('Sort ascending flag'),
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
      console.error('[Arobid MCP] Tool called: getBusinessProducts', args);
      const startTime = Date.now();

      try {
        const result = await getBusinessProducts(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getBusinessProducts (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getBusinessProducts (${Date.now() - startTime}ms): ${message}`
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


