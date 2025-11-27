/**
 * MCP tool for retrieving a specific business profile within an event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetBusinessExpoDetailInput {
  businessId: number;
  eventId: number;
  originCountryId?: number[];
  categoriesId?: number[];
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetBusinessExpoDetailResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetBusinessExpoDetailInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const getRequiredInt = (key: keyof GetBusinessExpoDetailInput): number => {
    const value = params[key as string];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} is required and must be an integer`);
    }
    return value;
  };

  const result: GetBusinessExpoDetailInput = {
    businessId: getRequiredInt('businessId'),
    eventId: getRequiredInt('eventId'),
  };

  const copyOptionalArray = (
    key: 'originCountryId' | 'categoriesId',
    validator: (value: unknown) => value is number
  ) => {
    const value = params[key];
    if (value === undefined) {
      return;
    }
    if (!Array.isArray(value) || !value.every(validator)) {
      throw new Error(`${key} must be an array of integers if provided`);
    }
    result[key] = value as number[];
  };

  copyOptionalArray('originCountryId', (value): value is number => typeof value === 'number');
  copyOptionalArray('categoriesId', (value): value is number => typeof value === 'number');

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

function buildHeaders(input: GetBusinessExpoDetailInput): Record<string, string> {
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

function buildQuery(input: GetBusinessExpoDetailInput): string {
  const params = new URLSearchParams();
  params.set('EventId', input.eventId.toString());

  if (input.originCountryId) {
    for (const id of input.originCountryId) {
      params.append('OriginCountryId', id.toString());
    }
  }

  if (input.categoriesId) {
    for (const id of input.categoriesId) {
      params.append('CategoriesId', id.toString());
    }
  }

  return params.toString();
}

/**
 * Gets business detail for an event
 */
export async function getBusinessExpoDetail(
  client: ArobidClient,
  input: unknown
): Promise<GetBusinessExpoDetailResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/v1/event/get-detail-business-expo-by-id/${validatedInput.businessId}${
      query ? `?${query}` : ''
    }`;
    const headers = buildHeaders(validatedInput);

    console.error(
      `[getBusinessExpoDetail] Fetching business ${validatedInput.businessId} for event ${validatedInput.eventId}`
    );

    const response = await client.get<GetBusinessExpoDetailResponse>(endpoint, headers);
    console.error('[getBusinessExpoDetail] Successfully fetched business detail');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getBusinessExpoDetail] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get business detail: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getBusinessExpoDetail] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get business detail: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


