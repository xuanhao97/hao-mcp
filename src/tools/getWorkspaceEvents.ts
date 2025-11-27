/**
 * MCP tool for retrieving events within the workspace context for a business
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface GetWorkspaceEventsInput {
  businessId: number;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: number[];
  originCountryId?: number[];
  nationalCode?: string[];
  eventType?: number[];
  type?: string[];
  categoryId?: number[];
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

export interface GetWorkspaceEventsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetWorkspaceEventsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  if (typeof params.businessId !== 'number' || !Number.isInteger(params.businessId)) {
    throw new Error('businessId is required and must be an integer');
  }

  const result: GetWorkspaceEventsInput = {
    businessId: params.businessId,
  };

  const copyOptionalString = (key: keyof GetWorkspaceEventsInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'string') {
      throw new Error(`${key as string} must be a string if provided`);
    }
    result[key] = value.trim() as never;
  };

  copyOptionalString('search');
  copyOptionalString('dateFrom');
  copyOptionalString('dateTo');
  copyOptionalString('filter');
  copyOptionalString('sortField');

  const copyOptionalInt = (key: keyof GetWorkspaceEventsInput) => {
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

  if (params.asc !== undefined) {
    if (typeof params.asc !== 'boolean') {
      throw new Error('asc must be a boolean if provided');
    }
    result.asc = params.asc;
  }

  const copyOptionalArray = <T>(
    key: keyof GetWorkspaceEventsInput,
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

  copyOptionalArray<number>('status', (item): item is number => typeof item === 'number');
  copyOptionalArray<number>('originCountryId', (item): item is number => typeof item === 'number');
  copyOptionalArray<string>('nationalCode', (item): item is string => typeof item === 'string');
  copyOptionalArray<number>('eventType', (item): item is number => typeof item === 'number');
  copyOptionalArray<string>('type', (item): item is string => typeof item === 'string');
  copyOptionalArray<number>('categoryId', (item): item is number => typeof item === 'number');

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

function buildHeaders(input: GetWorkspaceEventsInput): Record<string, string> {
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

function buildQuery(input: GetWorkspaceEventsInput): string {
  const params = new URLSearchParams();
  params.set('BusinessId', input.businessId.toString());

  if (input.search) params.set('Search', input.search);
  if (input.dateFrom) params.set('DateFrom', input.dateFrom);
  if (input.dateTo) params.set('DateTo', input.dateTo);
  if (input.pageSize !== undefined) params.set('PageSize', input.pageSize.toString());
  if (input.pageIndex !== undefined) params.set('PageIndex', input.pageIndex.toString());
  if (input.filter) params.set('Filter', input.filter);
  if (input.skip !== undefined) params.set('Skip', input.skip.toString());
  if (input.sortField) params.set('SortField', input.sortField);
  if (input.asc !== undefined) params.set('Asc', input.asc.toString());

  const appendMulti = (key: string, values?: (number | string)[]) => {
    if (!values) return;
    for (const value of values) {
      params.append(key, value.toString());
    }
  };

  appendMulti('Status', input.status);
  appendMulti('OriginCountryId', input.originCountryId);
  appendMulti('NationalCode', input.nationalCode);
  appendMulti('EventType', input.eventType);
  appendMulti('Type', input.type);
  appendMulti('CategoryId', input.categoryId);

  return params.toString();
}

export async function getWorkspaceEvents(
  client: ArobidClient,
  input: unknown
): Promise<GetWorkspaceEventsResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/workspace/get-all-event${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error(
      `[getWorkspaceEvents] Fetching workspace events for business ${validatedInput.businessId}`
    );

    const response = await client.get<GetWorkspaceEventsResponse>(endpoint, headers);
    console.error('[getWorkspaceEvents] Successfully fetched workspace events');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getWorkspaceEvents] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get workspace events: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getWorkspaceEvents] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get workspace events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


