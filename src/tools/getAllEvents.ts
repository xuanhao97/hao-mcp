/**
 * MCP tool for retrieving event listings with server-side filters
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface EventFiltersInput {
  pageSize?: number;
  pageIndex?: number;
  filter?: string;
  skip?: number;
  sortField?: string;
  asc?: boolean;
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  status?: number[];
  originCountryId?: number[];
  nationalCode?: string[];
  eventType?: number[];
  type?: string[];
  categoryId?: number[];
}

export interface GetAllEventsInput extends EventFiltersInput {
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface GetAllEventsResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): GetAllEventsInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: GetAllEventsInput = {};

  const copyOptionalNumber = (key: keyof EventFiltersInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key as string} must be an integer if provided`);
    }
    result[key] = value as never;
  };

  const copyOptionalBoolean = (key: keyof EventFiltersInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'boolean') {
      throw new Error(`${key as string} must be a boolean if provided`);
    }
    result[key] = value as never;
  };

  const copyOptionalString = (key: keyof EventFiltersInput) => {
    const value = params[key as string];
    if (value === undefined) {
      return;
    }
    if (typeof value !== 'string') {
      throw new Error(`${key as string} must be a string if provided`);
    }
    result[key] = value.trim() as never;
  };

  const copyOptionalArray = <T>(
    key: keyof EventFiltersInput,
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

  copyOptionalNumber('pageSize');
  copyOptionalNumber('pageIndex');
  copyOptionalString('filter');
  copyOptionalNumber('skip');
  copyOptionalString('sortField');
  copyOptionalBoolean('asc');
  copyOptionalString('search');
  copyOptionalString('dateFrom');
  copyOptionalString('dateTo');
  copyOptionalArray<number>('status', (item): item is number => typeof item === 'number');
  copyOptionalArray<number>(
    'originCountryId',
    (item): item is number => typeof item === 'number'
  );
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

function buildHeaders(input: GetAllEventsInput): Record<string, string> {
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

function buildPayload(input: EventFiltersInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {};
  const keys: (keyof EventFiltersInput)[] = [
    'pageSize',
    'pageIndex',
    'filter',
    'skip',
    'sortField',
    'asc',
    'search',
    'dateFrom',
    'dateTo',
    'status',
    'originCountryId',
    'nationalCode',
    'eventType',
    'type',
    'categoryId',
  ];

  for (const key of keys) {
    if (input[key] !== undefined) {
      payload[key] = input[key] as unknown;
    }
  }

  return payload;
}

/**
 * Gets all events with the provided filters
 */
export async function getAllEvents(
  client: ArobidClient,
  input: unknown
): Promise<GetAllEventsResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/v1/event/get-all-event';
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);

    console.error(
      `[getAllEvents] Fetching events with payload ${JSON.stringify(payload)} and headers ${JSON.stringify(
        headers
      )}`
    );

    const response = await client.post<GetAllEventsResponse>(endpoint, payload, headers);
    console.error('[getAllEvents] Successfully fetched events list');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getAllEvents] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get events list: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[getAllEvents] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get events list: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


