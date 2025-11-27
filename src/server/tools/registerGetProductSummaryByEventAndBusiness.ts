/**
 * Registration logic for the getProductSummaryByEventAndBusiness tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getProductSummaryByEventAndBusiness } from '../../tools/getProductSummaryByEventAndBusiness.js';

export function registerGetProductSummaryByEventAndBusiness(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'get-product-statistics-for-business-in-event',
    {
      title: 'Get Product Statistics for Business in Event',
      description:
        'Gets product statistics for a business in event. Required: eventId, businessId. Optional: language, currencyId, requestId, deviceId.',
      inputSchema: {
        eventId: z.number().int().positive().describe('ID of the event (path parameter)'),
        businessId: z.number().int().positive().describe('Business ID (path parameter)'),
        language: z.string().optional().describe('Language header (default: en)'),
        currencyId: z.number().int().positive().optional().describe('Currency header (default: 1)'),
        requestId: z.string().optional().describe('Optional RequestId header'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: getProductSummaryByEventAndBusiness', args);
      const startTime = Date.now();

      try {
        const result = await getProductSummaryByEventAndBusiness(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getProductSummaryByEventAndBusiness (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getProductSummaryByEventAndBusiness (${Date.now() - startTime}ms): ${message}`
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
