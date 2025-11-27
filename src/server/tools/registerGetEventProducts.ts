/**
 * Registration logic for the getEventProducts tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getEventProducts } from '../../tools/getEventProducts.js';

export function registerGetEventProducts(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'get-all-products-in-event',
    {
      title: 'Get All Products in an Event',
      description:
        'Retrieves all products from all exhibitors participating in a specific event, with advanced filtering capabilities. ' +
        'Use this tool when you need to browse or search through all products available in an event, regardless of which business is offering them. ' +
        'This is ideal for: (1) Building a product catalog/browse page for an event, (2) Searching for specific products across all exhibitors, (3) Filtering products by country, category, or other attributes. ' +
        'Supports filtering by: search keyword, originCountryId (array), nationalCode (array), expoBusinessCategoryId (array), isNew (newly added), isHighLight (featured), isActived (active only), pagination, sorting, and localization. ' +
        'Required: either id (query parameter) or eventId (body parameter) - provide at least one. Optional: pageSize (default 100), pageIndex (default 1), filter, skip, sortField, asc, search, originCountryId, nationalCode, expoBusinessCategoryId, isNew, isHighLight, isActived, language (default "en"), currencyId (default 1), requestId, deviceId.',
      inputSchema: {
        id: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Event ID passed via query parameter "id"'),
        eventId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Event ID provided in the body'),
        pageSize: z.number().int().positive().optional().describe('Page size (default 100)'),
        pageIndex: z.number().int().positive().optional().describe('Page index (default 1)'),
        filter: z.string().optional().describe('Filter expression'),
        skip: z.number().int().nonnegative().optional().describe('Records to skip'),
        sortField: z.string().optional().describe('Field to sort by'),
        asc: z.boolean().optional().describe('Sort ascending flag'),
        search: z.string().optional().describe('Free-text search keyword'),
        originCountryId: z.array(z.number().int()).optional().describe('Origin country filter'),
        nationalCode: z.array(z.string()).optional().describe('National codes filter'),
        expoBusinessCategoryId: z.array(z.number().int()).optional().describe('Business category IDs'),
        isNew: z.boolean().optional().describe('Filter new products'),
        isHighLight: z.boolean().optional().describe('Filter highlighted products'),
        isActived: z.boolean().optional().describe('Filter active products'),
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
      console.error('[Arobid MCP] Tool called: getEventProducts', args);
      const startTime = Date.now();

      try {
        const result = await getEventProducts(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getEventProducts (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getEventProducts (${Date.now() - startTime}ms): ${message}`
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


