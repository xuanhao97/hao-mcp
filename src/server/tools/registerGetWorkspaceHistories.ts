/**
 * Registration logic for the getWorkspaceHistories tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceHistories } from '../../tools/getWorkspaceHistories.js';

const historiesSchema = {
  businessId: z.number().int().positive().optional().describe('BusinessId query parameter'),
  eventId: z.number().int().positive().optional().describe('EventId query parameter'),
  search: z.string().optional().describe('Search keyword'),
  isRegisted: z.boolean().optional().describe('Filter by registered flag'),
  pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
  pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
  filter: z.string().optional().describe('Filter expression'),
  skip: z.number().int().nonnegative().optional().describe('Records to skip'),
  sortField: z.string().optional().describe('Field to sort by'),
  asc: z.boolean().optional().describe('Sort ascending flag'),
};

export function registerGetWorkspaceHistories(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getWorkspaceHistories',
    {
      title: 'Get Workspace Histories',
      description: 'Retrieves workspace histories.',
      inputSchema: {
        ...historiesSchema,
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
      console.error('[Arobid MCP] Tool called: getWorkspaceHistories', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceHistories(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceHistories (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getWorkspaceHistories (${Date.now() - start}ms): ${message}`
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


