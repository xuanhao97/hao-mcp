/**
 * Registration logic for the getWorkspaceRegistrationDetail tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspaceRegistrationDetail } from '../../tools/getWorkspaceRegistrationDetail.js';

export function registerGetWorkspaceRegistrationDetail(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getWorkspaceRegistrationDetail',
    {
      title: 'Get Workspace Registration Detail',
      description:
        'Retrieves registration detail.',
      inputSchema: {
        registrationId: z.number().int().positive().describe('Registration ID (path parameter)'),
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
      console.error('[Arobid MCP] Tool called: getWorkspaceRegistrationDetail', args);
      const start = Date.now();

      try {
        const result = await getWorkspaceRegistrationDetail(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspaceRegistrationDetail (${Date.now() - start}ms)`
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
          `[Arobid MCP] Tool execution error: getWorkspaceRegistrationDetail (${Date.now() - start}ms): ${message}`
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


