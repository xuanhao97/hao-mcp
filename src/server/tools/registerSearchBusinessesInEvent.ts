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
    'find-exhibitors-in-specific-event',
    {
      title: 'Find Exhibitors in a Specific Event',
      description:
        'Searches for businesses, exhibitors, or vendors participating in a specific event or exhibition. ' +
        'Use this tool when you have an event ID and want to find all exhibitors in that event, or search for specific businesses by name, category, country, or other criteria. ' +
        'This is ideal for: (1) Getting a list of all exhibitors in an event, (2) Finding specific businesses by name or keyword, (3) Filtering exhibitors by country, category, or other attributes. ' +
        'The response is formatted for quick AI processing, showing business names and a summary count. ' +
        'Supports filtering by: search term (business name/keyword), originCountryId (array), nationalCode (array), expoBusinessCategoryId (array), pagination, sorting, and localization. ' +
        'Required: eventId. Optional: search, pageSize (default 1000), pageIndex (default 1), sortField, asc, originCountryId, nationalCode, expoBusinessCategoryId, currencyId (default 1), language (default "en").',
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
            `[Arobid MCP] Found: ${result.found}, Total: ${result.total || result.data?.rowCount || 0}`
        );

        // Format response in a concise way for AI Agents to process quickly
        const businesses = result.data?.results || [];
        const found = result.found || businesses.length > 0;
        const total = result.total || result.data?.rowCount || businesses.length;
        
        let formattedText = '';
        
        if (found && businesses.length > 0) {
          // Extract business names (limit to 15 for faster processing)
          const businessNames: string[] = [];
          for (const business of businesses.slice(0, 15)) {
            if (business && typeof business === 'object') {
              const biz = business as Record<string, unknown>;
              const name =
                biz.name ||
                biz.businessName ||
                biz.companyName ||
                biz.title ||
                biz.fullName ||
                biz.organizationName;
              if (name && typeof name === 'string') {
                businessNames.push(name);
              }
            }
          }
          
          // Concise summary format for quick AI processing
          formattedText += `Tìm thấy ${total} doanh nghiệp trong sự kiện ${args.eventId}`;
          if (args.search) {
            formattedText += ` (từ khóa: "${args.search}")`;
          }
          formattedText += `.\n\n`;
          
          if (businessNames.length > 0) {
            formattedText += `Danh sách doanh nghiệp:\n`;
            businessNames.forEach((name, index) => {
              formattedText += `${index + 1}. ${name}\n`;
            });
            if (businesses.length > 15) {
              formattedText += `... và ${businesses.length - 15} doanh nghiệp khác.\n`;
            }
          }
        } else {
          formattedText += `Không tìm thấy doanh nghiệp nào`;
          if (args.search) {
            formattedText += ` với từ khóa "${args.search}"`;
          }
          formattedText += ` trong sự kiện ${args.eventId}.`;
        }

        return {
          content: [
            {
              type: 'text',
              text: formattedText,
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
