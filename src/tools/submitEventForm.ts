/**
 * MCP tool for submitting event registration/order forms
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { SubmitFormRequestInput, validateSubmitFormRequest } from './submitFormRequest.js';

export interface SubmitEventFormResponse {
  [key: string]: unknown;
}

function buildHeaders(input: SubmitFormRequestInput): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/json',
    'accept-language': input.language || 'en-US,en;q=0.9,vi;q=0.8',
    language: input.language || 'en',
    currencyid: input.currencyId?.toString() || '1',
  };

  if (input.requestId) headers['requestid'] = input.requestId;
  if (input.deviceId) headers['deviceid'] = input.deviceId;

  return headers;
}

export async function submitEventForm(
  client: ArobidClient,
  input: unknown
): Promise<SubmitEventFormResponse> {
  const validatedInput = validateSubmitFormRequest(input);

  try {
    const endpoint = '/tradexpo/api/event/submit-form';
    const headers = buildHeaders(validatedInput);

    console.error(
      `[submitEventForm] Submitting form for event ${validatedInput.eventId} ` +
        `business ${validatedInput.businessName || 'N/A'}`
    );

    const response = await client.post<SubmitEventFormResponse>(endpoint, validatedInput, headers);
    console.error('[submitEventForm] Successfully submitted event form');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[submitEventForm] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to submit event form: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[submitEventForm] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to submit event form: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


