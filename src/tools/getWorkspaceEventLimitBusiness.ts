/**
 * MCP tool for checking business participation limits in workspace events
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetWorkspaceEventLimitBusinessInput {
  eventId?: number;
  businessId?: number;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetWorkspaceEventLimitBusinessResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetWorkspaceEventLimitBusinessInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetWorkspaceEventLimitBusinessInput = {};

  if (params.eventId !== undefined) {
    if (typeof params.eventId !== 'number' || !Number.isInteger(params.eventId)) {
      throw new Error('eventId must be an integer if provided');
    }
    result.eventId = params.eventId;
  }

  if (params.businessId !== undefined) {
    if (typeof params.businessId !== 'number' || !Number.isInteger(params.businessId)) {
      throw new Error('businessId must be an integer if provided');
    }
    result.businessId = params.businessId;
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

function buildHeaders(input: GetWorkspaceEventLimitBusinessInput): Record<string, string> {
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

function buildPayload(input: GetWorkspaceEventLimitBusinessInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};

  if (input.eventId !== undefined) {
    payload.eventId = input.eventId;
  }

  if (input.businessId !== undefined) {
    payload.businessId = input.businessId;
  }

  return payload;
}

export async function getWorkspaceEventLimitBusiness(
  client: ArobidClient,
  input: unknown
): Promise<GetWorkspaceEventLimitBusinessResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/workspace/get-event-limit-business';
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error('[getWorkspaceEventLimitBusiness] Checking event limit for business');
    const response = await client.post<GetWorkspaceEventLimitBusinessResponse>(endpoint, payload, headers);
    console.error('[getWorkspaceEventLimitBusiness] Successfully fetched limits');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getWorkspaceEventLimitBusiness] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get workspace event limit: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getWorkspaceEventLimitBusiness] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get workspace event limit: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}


