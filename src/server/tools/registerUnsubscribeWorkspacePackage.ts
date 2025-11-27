/**
 * Registration logic for the unsubscribeWorkspacePackage tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { unsubscribeWorkspacePackage } from '../../tools/unsubscribeWorkspacePackage.js';

export function registerUnsubscribeWorkspacePackage(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'unsubscribeWorkspacePackage',
    {
      title: 'Unsubscribe Workspace Package',
      description:
        'Unsubscribes a package.',
      inputSchema: {
        id: z.number().int().positive().describe('Subscription ID'),
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
      console.error('[Arobid MCP] Tool called: unsubscribeWorkspacePackage', args);
      const start = Date.now();

      try {
        const result = await unsubscribeWorkspacePackage(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: unsubscribeWorkspacePackage (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: unsubscribeWorkspacePackage (${Date.now() - start}ms): ${message}`
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


