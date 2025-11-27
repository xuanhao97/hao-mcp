/**
 * Registration logic for the getBusinessByUser tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getBusinessByUser } from '../../tools/getBusinessByUser.js';

export function registerGetBusinessByUser(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-users-associated-businesses',
    {
      title: 'Get User\'s Associated Businesses',
      description:
        'Gets businesses associated with authenticated user. Requires login. Optional: language, currencyId, requestId, deviceId.',
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


