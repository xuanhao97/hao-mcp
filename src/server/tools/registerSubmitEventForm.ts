/**
 * Registration logic for the submitEventForm tool
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import * as z from 'zod';
import { ArobidClient } from '../../client/arobidClient.js';
import { submitEventForm } from '../../tools/submitEventForm.js';

const submitFormSchema = {
  eventId: z.number().int().positive().describe('Event ID'),
  name: z.string().optional(),
  status: z.string().optional(),
  note: z.string().optional(),
  prefix: z.string().optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().optional(),
  position: z.string().optional(),
  businessName: z.string().optional(),
  businessId: z.number().int().positive().optional(),
  taxCode: z.string().optional(),
  businessType: z.string().optional(),
  businessSector: z.array(z.string()).optional(),
  interestCategory: z.array(z.string()).optional(),
  visitPurpose: z.array(z.string()).optional(),
  eventSource: z.string().optional(),
  boothRegistration: z.string().optional(),
  isCreateAccount: z.boolean().optional(),
  isSubscribeNotifications: z.boolean().optional(),
  mainPackageIds: z.array(z.number().int().positive()).optional(),
  extraPackageIds: z.array(z.number().int().positive()).optional(),
  purchasedPackageIds: z.array(z.number().int().positive()).optional(),
  eventDate: z.string().optional(),
  couponCode: z.string().optional(),
  partnerCode: z.string().optional(),
  isAuthen: z.boolean().optional(),
  currencyId: z.number().int().positive().optional(),
  language: z.string().optional().describe('Language header (default: en)'),
  requestId: z.string().optional().describe('Optional RequestId header'),
  deviceId: z.string().optional().describe('Optional DeviceId header'),
};

export function registerSubmitEventForm(server: McpServer, client: ArobidClient): void {
  server.registerTool(
    'submit-event-registration-or-order',
    {
      title: 'Submit Event Registration or Order',
      description:
        'Submits event registration. Use after previewEventOrder. Required: eventId. Optional: packages, couponCode, contact/business info, isCreateAccount, isSubscribeNotifications. See inputSchema.',
      inputSchema: submitFormSchema,
    },
    async (args) => {
      console.error('[Arobid MCP] Tool called: submitEventForm', args);
      const start = Date.now();

      try {
        const result = await submitEventForm(client, args);
        console.error(
          `[Arobid MCP] Tool execution completed: submitEventForm (${Date.now() - start}ms)`
        );
        return {
          content: [
            { type: 'text', text: JSON.stringify(result, null, 2) },
          ],
        };
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        console.error(
          `[Arobid MCP] Tool execution error: submitEventForm (${Date.now() - start}ms): ${message}`
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


