/**
 * MCP tool for retrieving banner and hero assets of tradexpo events
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

/**
 * Input parameters accepted by the getEventBanners tool
 */
export interface GetEventBannersInput {
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

/**
 * Generic response placeholder. Shape depends on the backend.
 */
export interface GetEventBannersResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetEventBannersInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetEventBannersInput = {};

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

function buildHeaders(input: GetEventBannersInput): Record<string, string> {
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

/**
 * Retrieves banner assets for events
 */
export async function getEventBanners(
  client: ArobidClient,
  input: unknown
): Promise<GetEventBannersResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/v1/event/banners';
    const headers = buildHeaders(validatedInput);

    console.error(`[getEventBanners] Fetching banners with headers: ${JSON.stringify(headers)}`);

    const response = await client.get<GetEventBannersResponse>(endpoint, headers);

    console.error('[getEventBanners] Successfully fetched banners');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getEventBanners] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to fetch event banners: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getEventBanners] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to fetch event banners: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
