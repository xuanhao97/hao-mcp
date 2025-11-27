/**
 * MCP tool for counting upcoming events
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface CountEventsComingSoonInput {
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface CountEventsComingSoonResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): CountEventsComingSoonInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: CountEventsComingSoonInput = {};

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

function buildHeaders(input: CountEventsComingSoonInput): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/json',
    'accept-language': input.language || 'en-US,en;q=0.9,vi;q=0.8',
    language: input.language || 'en',
    currencyid: input.currencyId?.toString() || '1',
  };

  if (input.requestId) {
    headers['requestid'] = input.requestId;
  }

  if (input.deviceId) {
    headers['deviceid'] = input.deviceId;
  }

  return headers;
}

export async function countEventsComingSoon(
  client: ArobidClient,
  input: unknown
): Promise<CountEventsComingSoonResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/event/count-events-coming-soon';
    const headers = buildHeaders(validatedInput);

    console.error('[countEventsComingSoon] Fetching upcoming event count');
    const response = await client.get<CountEventsComingSoonResponse>(endpoint, headers);
    console.error('[countEventsComingSoon] Successfully fetched count');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[countEventsComingSoon] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to count upcoming events: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[countEventsComingSoon] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to count upcoming events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


