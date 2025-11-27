/**
 * Registration logic for the getCategoriesByBusiness tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getCategoriesByBusiness } from '../../tools/getCategoriesByBusiness.js';

export function registerGetCategoriesByBusiness(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'getCategoriesByBusiness',
    {
      title: 'Get Categories By Business',
      description:
        'Fetches categories tied to a business within an event.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID'),
        businessId: z.number().int().positive().describe('Business ID'),
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
      console.error('[Arobid MCP] Tool called: getCategoriesByBusiness', args);
      const start = Date.now();

      try {
        const result = await getCategoriesByBusiness(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getCategoriesByBusiness (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: getCategoriesByBusiness (${Date.now() - start}ms): ${message}`
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


