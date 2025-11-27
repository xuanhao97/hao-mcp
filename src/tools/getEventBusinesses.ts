/**
 * MCP tool for retrieving exhibitors/businesses of a specific event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetEventBusinessesInput {
  id?: number;
  eventId?: number;
  pageSize?: number;
  pageIndex?: number;
  filter?: string;
  skip?: number;
  sortField?: string;
  asc?: boolean;
  isNew?: boolean;
  isHighLight?: boolean;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetEventBusinessesResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetEventBusinessesInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;
  const result: GetEventBusinessesInput = {};

  const copyOptionalInt = (key: keyof GetEventBusinessesInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} must be an integer if provided`);
    }
    result[key] = value as never;
  };

  copyOptionalInt('id');
  copyOptionalInt('eventId');
  copyOptionalInt('pageSize');
  copyOptionalInt('pageIndex');
  copyOptionalInt('skip');

  if (params.filter !== undefined) {
    if (typeof params.filter !== 'string') {
      throw new Error('filter must be a string if provided');
    }
    result.filter = params.filter.trim();
  }

  if (params.sortField !== undefined) {
    if (typeof params.sortField !== 'string') {
      throw new Error('sortField must be a string if provided');
    }
    result.sortField = params.sortField.trim();
  }

  if (params.asc !== undefined) {
    if (typeof params.asc !== 'boolean') {
      throw new Error('asc must be a boolean if provided');
    }
    result.asc = params.asc;
  }

  if (params.isNew !== undefined) {
    if (typeof params.isNew !== 'boolean') {
      throw new Error('isNew must be a boolean if provided');
    }
    result.isNew = params.isNew;
  }

  if (params.isHighLight !== undefined) {
    if (typeof params.isHighLight !== 'boolean') {
      throw new Error('isHighLight must be a boolean if provided');
    }
    result.isHighLight = params.isHighLight;
  }

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

  if (result.id === undefined && result.eventId === undefined) {
    throw new Error('Provide either id query parameter or eventId in body to scope the event');
  }

  return result;
}

function buildHeaders(input: GetEventBusinessesInput): Record<string, string> {
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

function buildPayload(input: GetEventBusinessesInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keys: (keyof GetEventBusinessesInput)[] = [
    'pageSize',
    'pageIndex',
    'filter',
    'skip',
    'sortField',
    'asc',
    'eventId',
    'isNew',
    'isHighLight',
  ];

  for (const key of keys) {
    if (input[key] !== undefined) {
      payload[key] = input[key] as unknown;
    }
  }

  return payload;
}

function buildQueryString(input: GetEventBusinessesInput): string {
  const params = new URLSearchParams();
  if (input.id !== undefined) {
    params.set('id', input.id.toString());
  }
  return params.toString();
}

/**
 * Gets businesses for a specific event
 */
export async function getEventBusinesses(
  client: ArobidClient,
  input: unknown
): Promise<GetEventBusinessesResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQueryString(validatedInput);
    const endpoint = `/tradexpo/api/v1/event/get-business-by-event-id-mul-for-view-all${
      query ? `?${query}` : ''
    }`;
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error(
      `[getEventBusinesses] Fetching businesses for event ${validatedInput.eventId ?? validatedInput.id}\n` +
        `  Query: ${query || 'N/A'}\n` +
        `  Payload: ${JSON.stringify(payload)}`
    );

    const response = await client.post<GetEventBusinessesResponse>(endpoint, payload, headers);
    console.error('[getEventBusinesses] Successfully fetched businesses');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getEventBusinesses] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get event businesses: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getEventBusinesses] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get event businesses: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


