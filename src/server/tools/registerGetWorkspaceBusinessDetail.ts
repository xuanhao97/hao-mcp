/**
 * Registration logic for the getWorkspaceBusinessDetail tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceBusinessDetail } from '../../tools/getWorkspaceBusinessDetail.js';

export function registerGetWorkspaceBusinessDetail(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getWorkspaceBusinessDetail',
    {
      title: 'Get Workspace Business Detail',
      description:
        'Retrieves business details for a given event inside the organizer workspace via /tradexpo/api/workspace/get-detail-business/{eventId}.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID (path parameter)'),
        businessId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Optional businessId query parameter'),
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
      console.error('[Arobid MCP] Tool called: getWorkspaceBusinessDetail', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceBusinessDetail(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceBusinessDetail (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getWorkspaceBusinessDetail (${Date.now() - start}ms): ${message}`
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


