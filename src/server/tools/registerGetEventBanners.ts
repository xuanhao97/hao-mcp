/**
 * Registration logic for the getEventBanners tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getEventBanners } from '../../tools/getEventBanners.js';

export function registerGetEventBanners(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-hero-banners-and-featured-media',
    {
      title: 'Get Hero Banners and Featured Media',
      description:
        'Gets promotional banners and hero images for events. Optional: language ("en"), currencyId (1), requestId, deviceId.',
      inputSchema: {
        language: z.string().optional().describe('Language header (default: en)'),
        currencyId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Currency header (default: 1)'),
        requestId: z.string().optional().describe('Optional RequestId header for traceability'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: getEventBanners', args);
      const startTime = Date.now();

      try {
        const result = await getEventBanners(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getEventBanners (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getEventBanners (${Date.now() - startTime}ms): ${message}`
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


