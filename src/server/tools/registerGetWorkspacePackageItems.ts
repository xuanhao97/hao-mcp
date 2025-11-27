/**
 * Registration logic for the getWorkspacePackageItems tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspacePackageItems } from '../../tools/getWorkspacePackageItems.js';

const packageFilters = {
  isOnline: z.boolean().optional().describe('Filter online-only items'),
  isOnlineOffline: z.boolean().optional().describe('Filter hybrid items'),
  pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
  pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
  filter: z.string().optional().describe('Filter expression'),
  skip: z.number().int().nonnegative().optional().describe('Records to skip'),
  sortField: z.string().optional().describe('Field to sort by'),
  asc: z.boolean().optional().describe('Sort ascending flag'),
};

export function registerGetWorkspacePackageItems(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getWorkspacePackageItems',
    {
      title: 'Get Workspace Package Items',
      description: 'Retrieves package items via /tradexpo/api/workspace/get-all-package-item.',
      inputSchema: {
        ...packageFilters,
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
      console.error('[Arobid MCP] Tool called: getWorkspacePackageItems', args);
      const start = Date.now();

      try {
        const result = await getWorkspacePackageItems(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspacePackageItems (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getWorkspacePackageItems (${Date.now() - start}ms): ${message}`
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


