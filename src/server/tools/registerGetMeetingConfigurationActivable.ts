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
    'getMeetingConfigurationActivable',
    {
      title: 'Check Available Meeting Features for Event',
      description:
        'Retrieves information about which meeting and networking features are available and activable for a specific event. ' +
        'Use this tool when you need to determine what meeting capabilities an event supports, such as virtual meetings, networking features, or scheduling options. ' +
        'This is useful for: (1) Displaying available meeting features on event pages, (2) Determining if users can schedule meetings with exhibitors, (3) Building meeting/networking interfaces. ' +
        'The response indicates which meeting configurations are enabled and available for that event. ' +
        'Required: eventId. Optional: language (default "en"), currencyId (default 1), requestId, deviceId.',
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
