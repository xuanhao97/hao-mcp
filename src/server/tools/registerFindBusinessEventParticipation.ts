/**
 * Registration logic for the findBusinessEventParticipation tool.
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { findBusinessEventParticipation } from '../../tools/findBusinessEventParticipation.js';

export function registerFindBusinessEventParticipation(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'findBusinessEventParticipation',
    {
      title: 'Find Business Event Participation',
      description:
        'Determines which Arobid events a business participated in by scanning events (optionally filtered by search term) and matching exhibitor lists.',
      inputSchema: {
        businessName: z.string().min(1).describe('Name of the business to look up (required)'),
        eventIds: z
          .array(z.string().min(1))
          .optional()
          .describe('Explicit list of event IDs to scan (skips event discovery when provided)'),
        eventSearch: z
          .string()
          .optional()
          .describe('Search term for discovering events before scanning their exhibitor lists'),
        maxEvents: z
          .number()
          .int()
          .min(1)
          .max(1000)
          .optional()
          .describe('Maximum number of events to scan during discovery (default 200)'),
        eventPageSize: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Page size for event discovery calls (default 200)'),
        eventPageIndex: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Starting page index for event discovery (default 1)'),
        eventSortField: z.string().optional().describe('Event sort field when discovering events'),
        eventAsc: z
          .boolean()
          .optional()
          .describe('Whether to sort events ascending during discovery'),
        businessPageSize: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Page size passed to the exhibitor search API (default 1000)'),
        businessPageIndex: z
          .number()
          .int()
          .nonnegative()
          .optional()
          .describe('Page index passed to the exhibitor search API'),
        businessSortField: z
          .string()
          .optional()
          .describe('Sort field passed to the exhibitor search API'),
        businessAsc: z.boolean().optional().describe('Ascending order for exhibitor search'),
        originCountryId: z
          .array(z.number().int())
          .optional()
          .describe('Filter businesses by array of origin country IDs'),
        nationalCode: z
          .array(z.string())
          .optional()
          .describe('Filter businesses by array of national codes'),
        expoBusinessCategoryId: z
          .array(z.number().int())
          .optional()
          .describe('Filter businesses by array of business category IDs'),
        currencyId: z
          .number()
          .int()
          .positive()
          .optional()
          .describe('Currency ID for both event discovery and exhibitor search'),
        language: z
          .string()
          .optional()
          .describe('Language code used for both event discovery and exhibitor search'),
      },
    },
    async (args) => {
      try {
        const result = await findBusinessEventParticipation(client, args);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
