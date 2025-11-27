/**
 * Registration logic for the countEventsComingSoon tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { countEventsComingSoon } from '../../tools/countEventsComingSoon.js';

export function registerCountEventsComingSoon(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'count-upcoming-events',
    {
      title: 'Count Upcoming Events',
      description:
        'Returns the total count of upcoming events that are scheduled to start in the future. ' +
        'Use this tool when you need a quick count of upcoming events without retrieving the full event list. ' +
        'This is useful for displaying statistics, badges, or counts on dashboards or event listing pages. ' +
        'The response is a simple count number, making it efficient for quick queries. ' +
        'Optional parameters: language (default "en"), currencyId (default 1), requestId, deviceId.',
      inputSchema: {
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
      console.error('[Arobid MCP] Tool called: countEventsComingSoon', args);
      const startTime = Date.now();

      try {
        const result = await countEventsComingSoon(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: countEventsComingSoon (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: countEventsComingSoon (${Date.now() - startTime}ms): ${message}`
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


