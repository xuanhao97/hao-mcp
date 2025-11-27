/**
 * Registration logic for the getWorkspaceEventLimitBusiness tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceEventLimitBusiness } from '../../tools/getWorkspaceEventLimitBusiness.js';

export function registerGetWorkspaceEventLimitBusiness(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getWorkspaceEventLimitBusiness',
    {
      title: 'Get Workspace Event Limit Business',
      description:
        'Retrieves event participation limits.',
      inputSchema: {
        eventId: z.number().int().positive().optional().describe('Event ID in request body'),
        businessId: z.number().int().positive().optional().describe('Business ID in request body'),
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
      console.error('[Arobid MCP] Tool called: getWorkspaceEventLimitBusiness', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceEventLimitBusiness(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceEventLimitBusiness (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getWorkspaceEventLimitBusiness (${Date.now() - start}ms): ${message}`
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


