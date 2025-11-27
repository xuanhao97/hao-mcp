/**
 * Registration logic for the getEventBusinessProductSummary tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getEventBusinessProductSummary } from '../../tools/getEventBusinessProductSummary.js';

export function registerGetEventBusinessProductSummary(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getEventBusinessProductSummary',
    {
      title: 'Get Event Business/Product Summary',
      description:
        'Fetches aggregate counts of businesses and products inside an event via /tradexpo/api/event/get-business-and-product-summary/{eventId}.',
      inputSchema: {
        eventId: z.number().int().positive().describe('ID of the event'),
        language: z.string().optional().describe('Language header (default: en)'),
        currencyId: z.number().int().positive().optional().describe('Currency header (default: 1)'),
        requestId: z.string().optional().describe('Optional RequestId header'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: getEventBusinessProductSummary', args);
      const start = Date.now();

      try {
        const result = await getEventBusinessProductSummary(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getEventBusinessProductSummary (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getEventBusinessProductSummary (${Date.now() - start}ms): ${message}`
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
