/**
 * MCP tool for retrieving products showcased within an event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetEventProductsInput {
  id?: number;
  eventId?: number;
  pageSize?: number;
  pageIndex?: number;
  filter?: string;
  skip?: number;
  sortField?: string;
  asc?: boolean;
  search?: string;
  originCountryId?: number[];
  nationalCode?: string[];
  expoBusinessCategoryId?: number[];
  isNew?: boolean;
  isHighLight?: boolean;
  isActived?: boolean;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetEventProductsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetEventProductsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;
  const result: GetEventProductsInput = {};

  const copyOptionalInt = (key: keyof GetEventProductsInput) => {
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

  if (params.search !== undefined) {
    if (typeof params.search !== 'string') {
      throw new Error('search must be a string if provided');
    }
    result.search = params.search.trim();
  }

  const copyOptionalArray = <T>(
    key: keyof GetEventProductsInput,
    validator: (value: unknown) => value is T
  ) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (!Array.isArray(value) || !value.every(validator)) {
      throw new Error(`${key as string} must be an array of the expected type`);
    }
    result[key] = value as never;
  };

  copyOptionalArray<number>('originCountryId', (value): value is number => typeof value === 'number');
  copyOptionalArray<string>('nationalCode', (value): value is string => typeof value === 'string');
  copyOptionalArray<number>(
    'expoBusinessCategoryId',
    (value): value is number => typeof value === 'number'
  );

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

  if (params.isActived !== undefined) {
    if (typeof params.isActived !== 'boolean') {
      throw new Error('isActived must be a boolean if provided');
    }
    result.isActived = params.isActived;
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

function buildHeaders(input: GetEventProductsInput): Record<string, string> {
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

function buildPayload(input: GetEventProductsInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keys: (keyof GetEventProductsInput)[] = [
    'pageSize',
    'pageIndex',
    'filter',
    'skip',
    'sortField',
    'asc',
    'eventId',
    'search',
    'originCountryId',
    'nationalCode',
    'expoBusinessCategoryId',
    'isNew',
    'isHighLight',
    'isActived',
  ];

  for (const key of keys) {
    if (input[key] !== undefined) {
      payload[key] = input[key] as unknown;
    }
  }

  return payload;
}

function buildQuery(input: GetEventProductsInput): string {
  const params = new URLSearchParams();
  if (input.id !== undefined) {
    params.set('id', input.id.toString());
  }
  return params.toString();
}

/**
 * Gets products for a specific event
 */
export async function getEventProducts(
  client: ArobidClient,
  input: unknown
): Promise<GetEventProductsResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/v1/event/get-product-by-event-id-mul-for-view-all${
      query ? `?${query}` : ''
    }`;
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error(
      `[getEventProducts] Fetching products for event ${validatedInput.eventId ?? validatedInput.id}\n` +
        `  Query: ${query || 'N/A'}\n` +
        `  Payload: ${JSON.stringify(payload)}`
    );

    const response = await client.post<GetEventProductsResponse>(endpoint, payload, headers);
    console.error('[getEventProducts] Successfully fetched products');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getEventProducts] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get event products: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getEventProducts] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get event products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


