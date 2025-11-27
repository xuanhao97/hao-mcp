/**
 * Registration logic for the getAllEvents tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getAllEvents } from '../../tools/getAllEvents.js';
import { getStatusFilterDescription, getStatusCodesDescription } from '../../utils/eventStatusCodes.js';

const filtersSchema = {
  pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
  pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
  filter: z.string().optional().describe('Raw filter expression'),
  skip: z.number().int().nonnegative().optional().describe('Records to skip'),
  sortField: z.string().optional().describe('Field to sort by'),
  asc: z.boolean().optional().describe('Sort ascending (default false)'),
  search: z.string().optional().describe('Free-text search'),
  dateFrom: z.string().optional().describe('ISO date string lower bound'),
  dateTo: z.string().optional().describe('ISO date string upper bound'),
  status: z
    .array(z.number().int())
    .optional()
    .describe(
      getStatusFilterDescription('en') +
        '\n\n' +
        getStatusCodesDescription('en')
    ),
  originCountryId: z.array(z.number().int()).optional().describe('Origin country filter'),
  nationalCode: z.array(z.string()).optional().describe('National code filter'),
  eventType: z.array(z.number().int()).optional().describe('Event type filter'),
  type: z.array(z.string()).optional().describe('Event classification filter'),
  categoryId: z.array(z.number().int()).optional().describe('Category filter'),
};

export function registerGetAllEvents(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'query-events-with-advanced-filters',
    {
      title: 'Query Events with Advanced Filters',
      description:
        'Queries events with advanced filters: status, dateFrom/dateTo, originCountryId, nationalCode, eventType, type, categoryId, search. Supports pagination, sorting. All params optional.',
      inputSchema: {
        ...filtersSchema,
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
      console.error('[Arobid MCP] Tool called: getAllEvents', args);
      const startTime = Date.now();

      try {
        const result = await getAllEvents(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getAllEvents (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getAllEvents (${Date.now() - startTime}ms): ${message}`
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


