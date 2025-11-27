/**
 * Registration logic for the getWorkspaceEvents tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceEvents } from '../../tools/getWorkspaceEvents.js';

const commonFilters = {
  search: z.string().optional().describe('Search keyword'),
  dateFrom: z.string().optional().describe('ISO start date'),
  dateTo: z.string().optional().describe('ISO end date'),
  status: z.array(z.number().int()).optional().describe('Status filter'),
  originCountryId: z.array(z.number().int()).optional().describe('Origin country filter'),
  nationalCode: z.array(z.string()).optional().describe('National code filter'),
  eventType: z.array(z.number().int()).optional().describe('Event type filter'),
  type: z.array(z.string()).optional().describe('Event classification filter'),
  categoryId: z.array(z.number().int()).optional().describe('Category filter'),
  pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
  pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
  filter: z.string().optional().describe('Filter expression'),
  skip: z.number().int().nonnegative().optional().describe('Records to skip'),
  sortField: z.string().optional().describe('Field to sort by'),
  asc: z.boolean().optional().describe('Sort ascending flag'),
};

export function registerGetWorkspaceEvents(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getWorkspaceEvents',
    {
      title: 'Get Workspace Events',
      description:
        'Retrieves events available to a business.',
      inputSchema: {
        businessId: z.number().int().positive().describe('BusinessId query parameter (required)'),
        ...commonFilters,
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
      console.error('[Arobid MCP] Tool called: getWorkspaceEvents', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceEvents(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceEvents (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getWorkspaceEvents (${Date.now() - start}ms): ${message}`
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


