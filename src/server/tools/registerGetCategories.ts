/**
 * Registration logic for the getCategories tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getCategories } from '../../tools/getCategories.js';

export function registerGetCategories(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-product-and-business-categories',
    {
      title: 'Get Product and Business Categories',
      description:
        'Gets category hierarchy. Optional: search, level, parentId, id, language, currencyId.',
      inputSchema: {
        search: z.string().optional().describe('Search keyword'),
        level: z.number().int().optional().describe('Category level'),
        parentId: z.number().int().optional().describe('Parent category ID'),
        id: z.number().int().optional().describe('Specific category ID'),
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
      console.error('[Arobid MCP] Tool called: getCategories', args);
      const start = Date.now();

      try {
        const result = await getCategories(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getCategories (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getCategories (${Date.now() - start}ms): ${message}`
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


