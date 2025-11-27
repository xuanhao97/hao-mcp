/**
 * Registration logic for the getWorkspaceEventBanners tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceEventBanners } from '../../tools/getWorkspaceEventBanners.js';

export function registerGetWorkspaceEventBanners(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getWorkspaceEventBanners',
    {
      title: 'Get Workspace Event Banners',
      description:
        'Retrieves event banners associated with a business.',
      inputSchema: {
        businessId: z.number().int().positive().describe('Business ID (path parameter)'),
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
      console.error('[Arobid MCP] Tool called: getWorkspaceEventBanners', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceEventBanners(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceEventBanners (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getWorkspaceEventBanners (${Date.now() - start}ms): ${message}`
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


