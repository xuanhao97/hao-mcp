/**
 * Registration logic for the getCategoriesByEvent tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getCategoriesByEvent } from '../../tools/getCategoriesByEvent.js';

export function registerGetCategoriesByEvent(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-categories-available-in-event',
    {
      title: 'Get Categories Available in an Event',
      description:
        'Retrieves all categories that are used or available within a specific event or exhibition. ' +
        'Use this tool when you need to: (1) Display category filters for products or businesses in an event, (2) Understand what categories are relevant to a specific event, (3) Build category-based navigation for an event. ' +
        'This returns the categories that are actually used in the event context, which may differ from the global category list. ' +
        'Required: eventId. Optional: language (default "en"), currencyId (default 1), requestId, deviceId.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID (path parameter)'),
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
      console.error('[Arobid MCP] Tool called: getCategoriesByEvent', args);
      const start = Date.now();

      try {
        const result = await getCategoriesByEvent(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getCategoriesByEvent (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getCategoriesByEvent (${Date.now() - start}ms): ${message}`
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


