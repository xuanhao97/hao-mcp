/**
 * MCP tool for updating products linked to a business within the workspace
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import {
  ProductInformationInput,
  validateProductInformationInput,
} from './addWorkspaceProduct.js';

export interface UpdateWorkspaceProductResponse {
  [key: string]: unknown;
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

export async function updateWorkspaceProduct(
  client: ArobidClient,
  input: unknown
): Promise<UpdateWorkspaceProductResponse> {
  const validatedInput = validateProductInformationInput(input);

  try {
    const endpoint = '/tradexpo/api/workspace/update-product';
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error(
      `[updateWorkspaceProduct] Updating products ${validatedInput.productIds.join(',')} for business ${validatedInput.businessId}`
    );

    const response = await client.post<UpdateWorkspaceProductResponse>(endpoint, payload, headers);
    console.error('[updateWorkspaceProduct] Successfully updated products');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[updateWorkspaceProduct] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to update workspace products: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[updateWorkspaceProduct] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to update workspace products: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


