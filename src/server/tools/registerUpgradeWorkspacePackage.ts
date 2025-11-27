/**
 * Registration logic for the upgradeWorkspacePackage tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { upgradeWorkspacePackage } from '../../tools/upgradeWorkspacePackage.js';

export function registerUpgradeWorkspacePackage(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'upgradeWorkspacePackage',
    {
      title: 'Upgrade Workspace Package',
      description:
        'Calls /tradexpo/api/workspace/upgrade-package to upgrade package subscriptions.',
      inputSchema: {
        id: z.number().int().positive().optional().describe('Subscription ID'),
        currencyId: z.number().int().positive().optional().describe('Currency query parameter'),
        mainPackageIds: z.array(z.number().int().positive()).optional().describe('Main packages'),
        extraPackageIds: z.array(z.number().int().positive()).optional().describe('Extra packages'),
        purchasedPackageIds: z.array(z.number().int().positive()).optional().describe('Purchased packages'),
        language: z.string().optional().describe('Language header (default: en)'),
        requestId: z.string().optional().describe('Optional RequestId header'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: upgradeWorkspacePackage', args);
      const start = Date.now();

      try {
        const result = await upgradeWorkspacePackage(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: upgradeWorkspacePackage (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: upgradeWorkspacePackage (${Date.now() - start}ms): ${message}`
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


