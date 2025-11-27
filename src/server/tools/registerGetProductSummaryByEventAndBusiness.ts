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
    'getProductSummaryByEventAndBusiness',
    {
      title: 'Get Product Statistics for Business in Event',
      description:
        'Retrieves product statistics and summary information for a specific business/exhibitor within a particular event. ' +
        'Use this tool when you need to know how many products a business is showcasing in an event, or get summary statistics about their product catalog. ' +
        'This is useful for: (1) Displaying product count on business profile pages, (2) Showing statistics before loading the full product list, (3) Building business comparison features. ' +
        'The response includes product counts and statistics specific to how that business is represented in that event. ' +
        'Required: eventId and businessId. Optional: language (default "en"), currencyId (default 1), requestId, deviceId.',
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
