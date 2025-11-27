/**
 * MCP tool for adding products to a business within the workspace
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface ProductInformationInput {
  businessId: number;
  eventId: number;
  productIds: number[];
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface AddWorkspaceProductResponse {
  [key: string]: unknown;
}

export function validateProductInformationInput(input: unknown): ProductInformationInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const requireInt = (key: string): number => {
    const value = params[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key} is required and must be an integer`);
    }
    return value;
  };

  const productIds = params.productIds;
  if (!Array.isArray(productIds) || !productIds.every((id) => typeof id === 'number')) {
    throw new Error('productIds must be an array of numbers');
  }

  const result: ProductInformationInput = {
    businessId: requireInt('businessId'),
    eventId: requireInt('eventId'),
    productIds,
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

function buildHeaders(input: ProductInformationInput): Record<string, string> {
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

function buildPayload(input: ProductInformationInput): Record<string, unknown> {
  return {
    businessId: input.businessId,
    eventId: input.eventId,
    productIds: input.productIds,
  };
}

export async function addWorkspaceProduct(
  client: ArobidClient,
  input: unknown
): Promise<AddWorkspaceProductResponse> {
  const validatedInput = validateProductInformationInput(input);

  try {
    const endpoint = '/tradexpo/api/workspace/add-product';
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error(
      `[addWorkspaceProduct] Adding products ${validatedInput.productIds.join(',')} for business ${validatedInput.businessId}`
    );

    const response = await client.post<AddWorkspaceProductResponse>(endpoint, payload, headers);
    console.error('[addWorkspaceProduct] Successfully added products');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[addWorkspaceProduct] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to add workspace products: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[addWorkspaceProduct] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to add workspace products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


