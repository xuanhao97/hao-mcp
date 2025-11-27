/**
 * Registration logic for the getMeetingConfigurationActivable tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { getMeetingConfigurationActivable } from '../../tools/getMeetingConfigurationActivable.js';

export function registerGetMeetingConfigurationActivable(
  server: McpServer,
  client: ArobidClient
): void {
  server.registerTool(
    'check-available-meeting-features-for-event',
    {
      title: 'Check Available Meeting Features for Event',
      description:
        'Checks available meeting features for event. Required: eventId. Optional: language, currencyId, requestId, deviceId.',
      inputSchema: {
        eventId: z.number().int().positive().describe('Event ID (path parameter)'),
        language: z.string().optional().describe('Language header (default: en)'),
        currencyId: z.number().int().positive().optional().describe('Currency header (default: 1)'),
        requestId: z.string().optional().describe('Optional RequestId header'),
        deviceId: z.string().optional().describe('Optional DeviceId header'),
      },
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: getMeetingConfigurationActivable', args);
      const startTime = Date.now();

      try {
        const result = await getMeetingConfigurationActivable(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: getMeetingConfigurationActivable (${Date.now() - startTime}ms)`
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
          `[Arobid MCP] Tool execution error: getMeetingConfigurationActivable (${Date.now() - startTime}ms): ${message}`
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
