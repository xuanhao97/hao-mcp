/**
 * Registration logic for the getWorkspacePurchasedPackages tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getWorkspacePurchasedPackages } from '../../tools/getWorkspacePurchasedPackages.js';

export function registerGetWorkspacePurchasedPackages(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getWorkspacePurchasedPackages',
    {
      title: 'Get Workspace Purchased Packages',
      description:
        'Retrieves purchased packages via /tradexpo/api/workspace/get-all-purchased/{eventId}.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID (path parameter)'),
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
      console.error('[Arobid MCP] Tool called: getWorkspacePurchasedPackages', args);
      const start = Date.now();

      try {
        const result = await getWorkspacePurchasedPackages(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getWorkspacePurchasedPackages (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getWorkspacePurchasedPackages (${Date.now() - start}ms): ${message}`
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


