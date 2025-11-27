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
      title: 'Get User\'s Associated Businesses',
      description:
        'Retrieves all businesses that are associated with the currently authenticated user. ' +
        'Use this tool when you need to find out which businesses a user owns, manages, or is associated with. ' +
        'This requires the user to be authenticated (logged in) as it uses the current user\'s session to determine which businesses to return. ' +
        'The response includes a list of businesses linked to the authenticated user account. ' +
        'Useful for: displaying user\'s business dashboard, managing business profiles, or checking user permissions for specific businesses. ' +
        'Optional parameters: language (default "en"), currencyId (default 1), requestId, deviceId.',
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


