/**
 * Registration logic for the getBusinessByUser tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getBusinessByUser } from '../../tools/getBusinessByUser.js';

export function registerGetBusinessByUser(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getBusinessByUser',
    {
      title: 'Get Business By User',
      description: 'Retrieves businesses associated with the current user via /tradexpo/api/business/business-by-user.',
      inputSchema: {
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
      console.error('[Arobid MCP] Tool called: getBusinessByUser', args);
      const start = Date.now();

      try {
        const result = await getBusinessByUser(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getBusinessByUser (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getBusinessByUser (${Date.now() - start}ms): ${message}`
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


