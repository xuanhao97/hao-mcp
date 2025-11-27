/**
 * Registration logic for the searchEvents tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { searchEvents } from '../../tools/searchEvents.js';

/**
 * Registers the searchEvents tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerSearchEvents(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'search-active-exhibitions-and-events',
    {
      title: 'Search Active Exhibitions and Events',
      description:
        'Searches for active exhibitions and events on the Arobid platform with automatic pagination. ' +
        'This tool automatically crawls through all available pages to retrieve complete results, ensuring you get all matching events in a single response. ' +
        'Use this when you need to find events by name, keyword, or other criteria. The tool uses a large default page size (1000) for efficient data retrieval. ' +
        'Supports filtering by search term, pagination (automatic), sorting by various fields, and localization (language/currency). ' +
        'The response includes all events from all pages merged into a single array, along with pagination metadata showing total pages loaded and total events found. ' +
        'Optional parameters: search (keyword to filter events), pageSize (default 1000), pageIndex (default 1), sortField, asc (sort order), currencyId (default 1), language (default "en").',
      inputSchema: {
        search: z
          .string()
          .optional()
          .describe('Search term to filter events (e.g., "foodex")'),
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
        sortField: z
          .string()
          .optional()
          .describe('Field to sort by (e.g., "startTime")'),
        asc: z
          .boolean()
          .optional()
          .describe('Sort in ascending order (default: false)'),
        currencyId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Currency ID for pricing (default: 1)'),
        language: z
          .string()
          .optional()
          .describe('Language code for localization (default: "en")'),
      },
    },
    async (args) => {
      // Log the incoming request
      console.error(
        `[Arobid MCP] Tool called: searchEvents\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(args, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await searchEvents(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: searchEvents\n` +
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
          `[Arobid MCP] Tool execution error: searchEvents\n` +
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

