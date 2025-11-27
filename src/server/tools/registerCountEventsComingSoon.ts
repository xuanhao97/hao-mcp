/**
 * Registration logic for the countEventsComingSoon tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { countEventsComingSoon } from '../../tools/countEventsComingSoon.js';

export function registerCountEventsComingSoon(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'countEventsComingSoon',
    {
      title: 'Count Events Coming Soon',
      description: 'Returns the number of upcoming events from /tradexpo/api/event/count-events-coming-soon.',
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


