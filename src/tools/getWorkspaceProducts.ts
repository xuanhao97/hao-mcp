/**
 * MCP tool for retrieving all products accessible in the workspace dashboard
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetWorkspaceProductsInput {
  businessId?: number;
  eventId?: number;
  search?: string;
  isRegisted?: boolean;
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

export interface GetWorkspaceProductsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetWorkspaceProductsInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetWorkspaceProductsInput = {};

  const copyOptionalInt = (key: keyof GetWorkspaceProductsInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} must be an integer if provided`);
    }
    result[key] = value as never;
  };

  copyOptionalInt('businessId');
  copyOptionalInt('eventId');
  copyOptionalInt('pageSize');
  copyOptionalInt('pageIndex');
  copyOptionalInt('skip');

  if (params.search !== undefined) {
    if (typeof params.search !== 'string') {
      throw new Error('search must be a string if provided');
    }
    result.search = params.search.trim();
  }

  if (params.isRegisted !== undefined) {
    if (typeof params.isRegisted !== 'boolean') {
      throw new Error('isRegisted must be a boolean if provided');
    }
    result.isRegisted = params.isRegisted;
  }

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

function buildHeaders(input: GetWorkspaceProductsInput): Record<string, string> {
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

function buildQuery(input: GetWorkspaceProductsInput): string {
  const params = new URLSearchParams();

  if (input.businessId !== undefined) params.set('BusinessId', input.businessId.toString());
  if (input.eventId !== undefined) params.set('EventId', input.eventId.toString());
  if (input.search) params.set('Search', input.search);
  if (input.isRegisted !== undefined) params.set('IsRegisted', input.isRegisted.toString());
  if (input.pageSize !== undefined) params.set('PageSize', input.pageSize.toString());
  if (input.pageIndex !== undefined) params.set('PageIndex', input.pageIndex.toString());
  if (input.filter) params.set('Filter', input.filter);
  if (input.skip !== undefined) params.set('Skip', input.skip.toString());
  if (input.sortField) params.set('SortField', input.sortField);
  if (input.asc !== undefined) params.set('Asc', input.asc.toString());

  return params.toString();
}

export async function getWorkspaceProducts(
  client: ArobidClient,
  input: unknown
): Promise<GetWorkspaceProductsResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/workspace/get-all-products${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error('[getWorkspaceProducts] Fetching workspace products');
    const response = await client.get<GetWorkspaceProductsResponse>(endpoint, headers);
    console.error('[getWorkspaceProducts] Successfully fetched workspace products');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getWorkspaceProducts] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get workspace products: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getWorkspaceProducts] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get workspace products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


