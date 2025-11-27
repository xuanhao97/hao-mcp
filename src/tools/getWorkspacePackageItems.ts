/**
 * MCP tool for retrieving package items available in the workspace
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetWorkspacePackageItemsInput {
  isOnline?: boolean;
  isOnlineOffline?: boolean;
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

export interface GetWorkspacePackageItemsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetWorkspacePackageItemsInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetWorkspacePackageItemsInput = {};

  if (params.isOnline !== undefined) {
    if (typeof params.isOnline !== 'boolean') {
      throw new Error('isOnline must be a boolean if provided');
    }
    result.isOnline = params.isOnline;
  }

  if (params.isOnlineOffline !== undefined) {
    if (typeof params.isOnlineOffline !== 'boolean') {
      throw new Error('isOnlineOffline must be a boolean if provided');
    }
    result.isOnlineOffline = params.isOnlineOffline;
  }

  const copyOptionalInt = (key: keyof GetWorkspacePackageItemsInput) => {
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

function buildHeaders(input: GetWorkspacePackageItemsInput): Record<string, string> {
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

function buildQuery(input: GetWorkspacePackageItemsInput): string {
  const params = new URLSearchParams();

  if (input.isOnline !== undefined) params.set('IsOnline', input.isOnline.toString());
  if (input.isOnlineOffline !== undefined) params.set('IsOnlineOffline', input.isOnlineOffline.toString());
  if (input.pageSize !== undefined) params.set('PageSize', input.pageSize.toString());
  if (input.pageIndex !== undefined) params.set('PageIndex', input.pageIndex.toString());
  if (input.filter) params.set('Filter', input.filter);
  if (input.skip !== undefined) params.set('Skip', input.skip.toString());
  if (input.sortField) params.set('SortField', input.sortField);
  if (input.asc !== undefined) params.set('Asc', input.asc.toString());

  return params.toString();
}

export async function getWorkspacePackageItems(
  client: ArobidClient,
  input: unknown
): Promise<GetWorkspacePackageItemsResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/workspace/get-all-package-item${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error('[getWorkspacePackageItems] Fetching workspace package items');
    const response = await client.get<GetWorkspacePackageItemsResponse>(endpoint, headers);
    console.error('[getWorkspacePackageItems] Successfully fetched package items');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getWorkspacePackageItems] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get workspace package items: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getWorkspacePackageItems] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get workspace package items: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}


