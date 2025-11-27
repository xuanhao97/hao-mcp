/**
 * Registration logic for the searchBusinessesInEvent tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { searchBusinessesInEvent } from '../../tools/searchBusinessesInEvent.js';

/**
 * Registers the searchBusinessesInEvent tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerSearchBusinessesInEvent(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'searchBusinessesInEvent',
    {
      title: 'Search Businesses in Event',
      description:
        'Searches for businesses within a specific event/exhibition on Arobid platform. Supports filtering by search term, pagination, sorting, and various filter options.',
      inputSchema: {
        eventId: z.string().min(1).describe('Event ID to search businesses in (required)'),
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
      // Log the incoming request
      console.error(
        `[Arobid MCP] Tool called: searchBusinessesInEvent\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(args, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await searchBusinessesInEvent(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: searchBusinessesInEvent\n` +
            `[Arobid MCP] Duration: ${duration}ms\n` +
            `[Arobid MCP] Result: ${JSON.stringify(result, null, 2)}`
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
        const duration = Date.now() - startTime;
        // Convert errors to MCP-friendly format
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        console.error(
          `[Arobid MCP] Tool execution error: searchBusinessesInEvent\n` +
            `[Arobid MCP] Duration: ${duration}ms\n` +
            `[Arobid MCP] Error: ${errorMessage}`
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: errorMessage }, null, 2),
            },
          ],
          isError: true,
        };
      }
    }
  );
}
