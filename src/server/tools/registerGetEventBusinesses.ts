/**
 * Registration logic for the getEventBusinesses tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getEventBusinesses } from '../../tools/getEventBusinesses.js';

export function registerGetEventBusinesses(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-all-exhibitors-for-event',
    {
      title: 'Get All Exhibitors for an Event',
      description:
        'Gets all exhibitors for an event. Required: id or eventId. Optional: pageSize (100), pageIndex (1), filter, skip, sortField, asc, isNew, isHighLight, language, currencyId, requestId, deviceId.',
      inputSchema: {
        id: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Event ID passed as query parameter "id"'),
        eventId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Event ID passed in the request body'),
        pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
        pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
        filter: z.string().optional().describe('Filter expression'),
        skip: z.number().int().nonnegative().optional().describe('Records to skip'),
        sortField: z.string().optional().describe('Field to sort by'),
        asc: z.boolean().optional().describe('Sort ascending flag'),
        isNew: z.boolean().optional().describe('Filter for newly joined businesses'),
        isHighLight: z.boolean().optional().describe('Filter for highlighted businesses'),
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
      console.error('[Arobid MCP] Tool called: getEventBusinesses', args);
      const startTime = Date.now();

      try {
        const result = await getEventBusinesses(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getEventBusinesses (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getEventBusinesses (${Date.now() - startTime}ms): ${message}`
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


