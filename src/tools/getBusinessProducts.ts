/**
 * MCP tool for retrieving products belonging to a specific business within an event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetBusinessProductsInput {
  eventId: number;
  businessId: number;
  pageSize?: number;
  pageIndex?: number;
  filter?: string;
  skip?: number;
  sortField?: string;
  asc?: boolean;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetBusinessProductsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetBusinessProductsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const getRequiredInt = (key: keyof GetBusinessProductsInput): number => {
    const value = params[key as string];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} is required and must be an integer`);
    }
    return value;
  };

  const result: GetBusinessProductsInput = {
    eventId: getRequiredInt('eventId'),
    businessId: getRequiredInt('businessId'),
  };

  const copyOptionalInt = (key: keyof GetBusinessProductsInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} must be an integer if provided`);
    }
    result[key] = value as never;
  };

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

function buildHeaders(input: GetBusinessProductsInput): Record<string, string> {
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

function buildQuery(input: GetBusinessProductsInput): string {
  const params = new URLSearchParams();

  params.set('PageSize', (input.pageSize ?? 100).toString());
  params.set('PageIndex', (input.pageIndex ?? 1).toString());

  if (input.filter) {
    params.set('Filter', input.filter);
  }

  if (input.skip !== undefined) {
    params.set('Skip', input.skip.toString());
  }

  if (input.sortField) {
    params.set('SortField', input.sortField);
  }

  if (input.asc !== undefined) {
    params.set('Asc', input.asc.toString());
  }

  return params.toString();
}

/**
 * Calls /tradexpo/api/v1/event/{id}/business/{businessId}/products
 */
export async function getBusinessProducts(
  client: ArobidClient,
  input: unknown
): Promise<GetBusinessProductsResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/v1/event/${validatedInput.eventId}/business/${validatedInput.businessId}/products${
      query ? `?${query}` : ''
    }`;
    const headers = buildHeaders(validatedInput);

    console.error(
      `[getBusinessProducts] Fetching products for business ${validatedInput.businessId} in event ${validatedInput.eventId}`
    );

    const response = await client.get<GetBusinessProductsResponse>(endpoint, headers);
    console.error('[getBusinessProducts] Successfully fetched business products');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getBusinessProducts] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get business products: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getBusinessProducts] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get business products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


