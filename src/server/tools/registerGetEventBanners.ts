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
        'Retrieves promotional banners, hero images, and spotlight media content for tradexpo events. ' +
        'Use this tool when you need to display featured event content, promotional banners, or spotlight media on a homepage or event listing page. ' +
        'The response includes hero banners and spotlight media that are typically used for marketing and promotional purposes. ' +
        'This is useful for building event discovery interfaces or displaying featured events prominently. ' +
        'Optional parameters: language (default "en"), currencyId (default 1), requestId (for traceability), deviceId.',
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


