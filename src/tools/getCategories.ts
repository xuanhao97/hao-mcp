/**
 * MCP tool for retrieving categories with optional filters
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetCategoriesInput {
  search?: string;
  level?: number;
  parentId?: number;
  id?: number;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetCategoriesResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetCategoriesInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetCategoriesInput = {};

  if (params.search !== undefined) {
    if (typeof params.search !== 'string') {
      throw new Error('search must be a string if provided');
    }
    result.search = params.search.trim();
  }

  const numericFields: (keyof GetCategoriesInput)[] = ['level', 'parentId', 'id'];
  for (const field of numericFields) {
    if (params[field as string] !== undefined) {
      const value = params[field as string];
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`${field as string} must be an integer if provided`);
      }
      result[field] = value as never;
    }
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

function buildHeaders(input: GetCategoriesInput): Record<string, string> {
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

function buildQuery(input: GetCategoriesInput): string {
  const params = new URLSearchParams();
  if (input.search) params.set('Search', input.search);
  if (input.level !== undefined) params.set('Level', input.level.toString());
  if (input.parentId !== undefined) params.set('ParentId', input.parentId.toString());
  if (input.id !== undefined) params.set('Id', input.id.toString());
  return params.toString();
}

export async function getCategories(
  client: ArobidClient,
  input: unknown
): Promise<GetCategoriesResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/category/get-all-categories${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error('[getCategories] Fetching categories');
    const response = await client.get<GetCategoriesResponse>(endpoint, headers);
    console.error('[getCategories] Successfully fetched categories');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getCategories] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get categories: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getCategories] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get categories: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


