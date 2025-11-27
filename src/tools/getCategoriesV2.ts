/**
 * MCP tool for retrieving categories
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetCategoriesV2Input {
  id?: number;
  level?: number;
  aliasCode?: string;
  categoryType?: string;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetCategoriesV2Response {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetCategoriesV2Input {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetCategoriesV2Input = {};

  const numericFields: (keyof GetCategoriesV2Input)[] = ['id', 'level'];
  for (const field of numericFields) {
    if (params[field as string] !== undefined) {
      const value = params[field as string];
      if (typeof value !== 'number' || !Number.isInteger(value)) {
        throw new Error(`${field as string} must be an integer if provided`);
      }
      result[field] = value as never;
    }
  }

  if (params.aliasCode !== undefined) {
    if (typeof params.aliasCode !== 'string') {
      throw new Error('aliasCode must be a string if provided');
    }
    result.aliasCode = params.aliasCode.trim();
  }

  if (params.categoryType !== undefined) {
    if (typeof params.categoryType !== 'string') {
      throw new Error('categoryType must be a string if provided');
    }
    result.categoryType = params.categoryType.trim();
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

function buildHeaders(input: GetCategoriesV2Input): Record<string, string> {
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

function buildQuery(input: GetCategoriesV2Input): string {
  const params = new URLSearchParams();
  if (input.id !== undefined) params.set('Id', input.id.toString());
  if (input.level !== undefined) params.set('Level', input.level.toString());
  if (input.aliasCode) params.set('AliasCode', input.aliasCode);
  if (input.categoryType) params.set('CategoryType', input.categoryType);
  return params.toString();
}

export async function getCategoriesV2(
  client: ArobidClient,
  input: unknown
): Promise<GetCategoriesV2Response> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/category/get-all-categories-v2${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error('[getCategoriesV2] Fetching categories (v2)');
    const response = await client.get<GetCategoriesV2Response>(endpoint, headers);
    console.error('[getCategoriesV2] Successfully fetched categories (v2)');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getCategoriesV2] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get categories v2: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getCategoriesV2] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get categories v2: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


