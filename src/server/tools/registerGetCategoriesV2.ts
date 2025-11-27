/**
 * Registration logic for the getCategoriesV2 tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getCategoriesV2 } from '../../tools/getCategoriesV2.js';

export function registerGetCategoriesV2(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-categories-enhanced-version',
    {
      title: 'Get Categories (Enhanced Version)',
      description:
        'Retrieves categories using an enhanced API version with additional filtering options including alias codes and category types. ' +
        'Use this tool when you need category information with more advanced filtering capabilities than the standard getCategories tool. ' +
        'This version supports filtering by: aliasCode (category alias identifiers), categoryType (type of category), level (hierarchy depth), and id (specific category). ' +
        'Useful for: (1) Finding categories by their alias codes, (2) Filtering by category type, (3) Getting category details with enhanced metadata. ' +
        'All parameters are optional. Use aliasCode to find categories by their alias, categoryType to filter by type, level for hierarchy depth, or id for a specific category.',
      inputSchema: {
        id: z.number().int().positive().optional().describe('Specific category ID'),
        level: z.number().int().optional().describe('Category level'),
        aliasCode: z.string().optional().describe('Alias code filter'),
        categoryType: z.string().optional().describe('Category type filter'),
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
      console.error('[Arobid MCP] Tool called: getCategoriesV2', args);
      const start = Date.now();

      try {
        const result = await getCategoriesV2(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getCategoriesV2 (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getCategoriesV2 (${Date.now() - start}ms): ${message}`
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


