/**
 * MCP tool for retrieving categories associated with an event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetCategoriesByEventInput {
  eventId: number;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetCategoriesByEventResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetCategoriesByEventInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;
  if (typeof params.eventId !== 'number' || !Number.isInteger(params.eventId)) {
    throw new Error('eventId is required and must be an integer');
  }

  const result: GetCategoriesByEventInput = {
    eventId: params.eventId,
  };

  if (params.language !== undefined) {
    if (typeof params.language !== 'string') {
      throw new Error('language must be a string if provided');
    }
    result.language = params.language.trim();
  }

  if (params.currencyId !== undefined) {
    if (
      typeof params.currencyId !== 'number' ||
      params.currencyId < 1 ||
      !Number.isInteger(params.currencyId)
    ) {
      throw new Error('currencyId must be a positive integer if provided');
    }
    result.currencyId = params.currencyId;
  }

  if (params.requestId !== undefined) {
    if (typeof params.requestId !== 'string') {
      throw new Error('requestId must be a string if provided');
    }
    result.requestId = params.requestId.trim();
  }

  if (params.deviceId !== undefined) {
    if (typeof params.deviceId !== 'string') {
      throw new Error('deviceId must be a string if provided');
    }
    result.deviceId = params.deviceId.trim();
  }

  return result;
}

function buildHeaders(input: GetCategoriesByEventInput): Record<string, string> {
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

export async function getCategoriesByEvent(
  client: ArobidClient,
  input: unknown
): Promise<GetCategoriesByEventResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = `/tradexpo/api/category/get-all-categories-by-event-id/${validatedInput.eventId}`;
    const headers = buildHeaders(validatedInput);

    console.error(`[getCategoriesByEvent] Fetching categories for event ${validatedInput.eventId}`);
    const response = await client.get<GetCategoriesByEventResponse>(endpoint, headers);
    console.error('[getCategoriesByEvent] Successfully fetched event categories');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getCategoriesByEvent] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get categories by event: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getCategoriesByEvent] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get categories by event: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


