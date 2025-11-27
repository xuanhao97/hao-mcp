/**
 * Registration logic for the searchBusinessesInMultipleEvents tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { searchBusinessesInMultipleEvents } from '../../tools/searchBusinessesInMultipleEvents.js';

/**
 * Registers the searchBusinessesInMultipleEvents tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerSearchBusinessesInMultipleEvents(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'searchBusinessesInMultipleEvents',
    {
      title: 'Search Businesses in Multiple Events',
      description:
        'Searches for businesses across multiple events/exhibitions on Arobid platform. Processes events in batches and returns raw data for AI to process and make decisions. Each event result contains the full API response structure.',
      inputSchema: {
        eventIds: z
          .array(z.string().min(1))
          .min(1)
          .describe('Array of event IDs to search businesses in (required, at least one event ID)'),
        search: z.string().optional().describe('Search term to filter businesses'),
        pageSize: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Number of results per page (default: 1000)'),
        pageIndex: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe('Page index (0-based or 1-based, default: 1)'),
        sortField: z.string().optional().describe('Field to sort by'),
        asc: z.boolean().optional().describe('Sort in ascending order (default: false)'),
        originCountryId: z
          .array(z.number().int())
          .optional()
          .describe('Array of origin country IDs to filter by'),
        nationalCode: z
          .array(z.string())
          .optional()
          .describe('Array of national codes to filter by'),
        expoBusinessCategoryId: z
          .array(z.number().int())
          .optional()
          .describe('Array of business category IDs to filter by'),
        currencyId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Currency ID for pricing (default: 1)'),
        language: z.string().optional().describe('Language code for localization (default: "en")'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: searchBusinessesInMultipleEvents', args);
      const startTime = Date.now();

      try {
        const result = await searchBusinessesInMultipleEvents(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: searchBusinessesInMultipleEvents (${Date.now() - startTime}ms)`
        );

        // Return raw data for AI to process and make decisions
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
          `[Arobid MCP] Tool execution error: searchBusinessesInMultipleEvents (${Date.now() - startTime}ms): ${message}`
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
