/**
 * MCP tool for previewing event order pricing before submission
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { SubmitFormRequestInput, validateSubmitFormRequest } from './submitFormRequest.js';

export interface PreviewEventOrderResponse {
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

export async function previewEventOrder(
  client: ArobidClient,
  input: unknown
): Promise<PreviewEventOrderResponse> {
  const validatedInput = validateSubmitFormRequest(input);

  try {
    const endpoint = '/tradexpo/api/event/preview-order';
    const headers = buildHeaders(validatedInput);

    console.error(
      `[previewEventOrder] Previewing order for event ${validatedInput.eventId} with packages ` +
        `${(validatedInput.mainPackageIds || []).length} main / ${(validatedInput.extraPackageIds || []).length} extra`
    );

    const response = await client.post<PreviewEventOrderResponse>(endpoint, validatedInput, headers);
    console.error('[previewEventOrder] Successfully previewed order');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[previewEventOrder] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to preview event order: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[previewEventOrder] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to preview event order: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


