/**
 * Registration logic for the getCategoriesByBusiness tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getCategoriesByBusiness } from '../../tools/getCategoriesByBusiness.js';

export function registerGetCategoriesByBusiness(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-categories-for-business-in-event',
    {
      title: 'Get Categories for a Business in Event',
      description:
        'Retrieves all categories that a specific business/exhibitor is associated with within a particular event. ' +
        'Use this tool when you need to know which product or business categories a specific exhibitor belongs to in an event context. ' +
        'This is useful for: (1) Displaying category tags on a business profile page, (2) Filtering businesses by their categories, (3) Understanding how businesses are categorized in events. ' +
        'The response includes all categories that the business is classified under in that specific event. ' +
        'Required: eventId and businessId. Optional: language (default "en"), currencyId (default 1), requestId, deviceId.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID'),
        businessId: z.number().int().positive().describe('Business ID'),
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
      console.error('[Arobid MCP] Tool called: getCategoriesByBusiness', args);
      const start = Date.now();

      try {
        const result = await getCategoriesByBusiness(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getCategoriesByBusiness (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getCategoriesByBusiness (${Date.now() - start}ms): ${message}`
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


