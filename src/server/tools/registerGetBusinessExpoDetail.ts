/**
 * Registration logic for the getBusinessExpoDetail tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getBusinessExpoDetail } from '../../tools/getBusinessExpoDetail.js';

export function registerGetBusinessExpoDetail(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getBusinessExpoDetail',
    {
      title: 'Get Exhibitor Profile in Event',
      description:
        'Retrieves the complete detailed profile of a business/exhibitor as they appear in a specific event or exhibition. ' +
        'Use this tool when you have both a business ID and event ID and need comprehensive information about how that business is presented in that event, including their showcase, products, statistics, and event-specific details. ' +
        'The response includes: business profile information, showcases, statistics, contact details, categories, and other event-specific metadata. ' +
        'This is different from general business information - it shows how the business is represented within the context of a specific event. ' +
        'Required: businessId (the business/exhibitor ID) and eventId (the event ID). Optional: originCountryId (array), categoriesId (array), language (default "en"), currencyId (default 1), requestId, deviceId.',
      inputSchema: {
        businessId: z.number().int().positive().describe('Business ID path parameter'),
        eventId: z.number().int().positive().describe('EventId query parameter'),
        originCountryId: z
          .array(z.number().int())
          .optional()
          .describe('OriginCountryId multi-value query parameter'),
        categoriesId: z
          .array(z.number().int())
          .optional()
          .describe('CategoriesId multi-value query parameter'),
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
      console.error('[Arobid MCP] Tool called: getBusinessExpoDetail', args);
      const startTime = Date.now();

      try {
        const result = await getBusinessExpoDetail(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getBusinessExpoDetail (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getBusinessExpoDetail (${Date.now() - startTime}ms): ${message}`
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


