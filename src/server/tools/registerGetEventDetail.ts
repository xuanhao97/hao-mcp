/**
 * Registration logic for the getEventDetail tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getEventDetail } from '../../tools/getEventDetail.js';

/**
 * Registers the getEventDetail tool on the MCP server
 * @param server - The MCP server instance to register the tool on
 * @param client - The Arobid client instance to use for API calls
 */
export function registerGetEventDetail(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'getEventDetail',
    {
      title: 'Get Detailed Event Information',
      description:
        'Retrieves comprehensive details for a specific event or exhibition by its event ID. ' +
        'Use this tool when you have an event ID (from searchEvents, getAllEvents, or other sources) and need complete information about that event, including description, dates, location, pricing, categories, and other metadata. ' +
        'The response includes all event details such as name, description, start/end dates, venue information, pricing, categories, status, and more. ' +
        'Supports localization through currencyId (for pricing display) and language (for translated content). ' +
        'Required: eventId (the unique identifier of the event). Optional: currencyId (default 1), language (default "en").',
      inputSchema: {
        eventId: z
          .string()
          .min(1)
          .describe('Event ID to get details for (required)'),
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
        `[Arobid MCP] Tool called: getEventDetail\n` +
          `[Arobid MCP] Request parameters: ${JSON.stringify(args, null, 2)}`
      );

      const startTime = Date.now();
      try {
        // Args are already validated by Zod schema, so we can pass them directly
        const result = await getEventDetail(client, args);
        const duration = Date.now() - startTime;

        console.error(
          `[Arobid MCP] Tool execution completed: getEventDetail\n` +
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
          `[Arobid MCP] Tool execution error: getEventDetail\n` +
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

