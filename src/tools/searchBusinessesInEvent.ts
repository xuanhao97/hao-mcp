/**
 * MCP tool for searching businesses in a specific event on Arobid platform
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { validateNonEmptyString } from '../utils/validation.js';

/**
 * Input parameters for searching businesses in an event
 */
export interface SearchBusinessesInEventInput {
  eventId: string;
  search?: string;
  pageSize?: number;
  pageIndex?: number;
  sortField?: string;
  asc?: boolean;
  originCountryId?: number[];
  nationalCode?: string[];
  expoBusinessCategoryId?: number[];
  currencyId?: number;
  language?: string;
}

/**
 * Response from Arobid Backend after searching businesses in an event
 * Based on actual API response structure:
 * {
 *   data: {
 *     results: Business[],  // Main array of businesses
 *     currentPage: number,
 *     pageCount: number,
 *     pageSize: number,
 *     rowCount: number,
 *     totalElement: number,
 *     firstRowOnPage: number,
 *     lastRowOnPage: number
 *   },
 *   isSucceeded: boolean
 * }
 */
export interface SearchBusinessesInEventResponse {
  data?: {
    results?: unknown[]; // Main array of businesses (always present in actual API response)
    currentPage?: number;
    pageCount?: number;
    pageSize?: number;
    rowCount?: number;
    totalElement?: number;
    firstRowOnPage?: number;
    lastRowOnPage?: number;
  };
  isSucceeded?: boolean;
  // Enhanced fields added by our function
  found?: boolean;
  total?: number;
  // Allow for additional fields
  [key: string]: unknown;
}

/**
 * Validates input parameters for searching businesses in an event
 */
function validateInput(input: unknown): SearchBusinessesInEventInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required field: eventId
  validateNonEmptyString(params.eventId, 'eventId');
  const result: SearchBusinessesInEventInput = {
    eventId: (params.eventId as string).trim(),
  };

  // Optional search string
  if (params.search !== undefined) {
    if (typeof params.search !== 'string') {
      throw new Error('search must be a string if provided');
    }
    result.search = params.search.trim();
  }

  // Optional pageSize (must be positive integer, default: 1000)
  if (params.pageSize !== undefined) {
    if (
      typeof params.pageSize !== 'number' ||
      params.pageSize < 1 ||
      !Number.isInteger(params.pageSize)
    ) {
      throw new Error('pageSize must be a positive integer if provided');
    }
    result.pageSize = params.pageSize;
  } else {
    result.pageSize = 1000; // Default to 1000
  }

  // Optional pageIndex (must be non-negative integer, 0-based or 1-based)
  if (params.pageIndex !== undefined) {
    if (
      typeof params.pageIndex !== 'number' ||
      params.pageIndex < 0 ||
      !Number.isInteger(params.pageIndex)
    ) {
      throw new Error('pageIndex must be a non-negative integer if provided');
    }
    result.pageIndex = params.pageIndex;
  }

  // Optional sortField
  if (params.sortField !== undefined) {
    if (typeof params.sortField !== 'string') {
      throw new Error('sortField must be a string if provided');
    }
    result.sortField = params.sortField.trim();
  }

  // Optional asc (ascending order)
  if (params.asc !== undefined) {
    if (typeof params.asc !== 'boolean') {
      throw new Error('asc must be a boolean if provided');
    }
    result.asc = params.asc;
  }

  // Optional originCountryId (array of numbers)
  if (params.originCountryId !== undefined) {
    if (!Array.isArray(params.originCountryId)) {
      throw new Error('originCountryId must be an array if provided');
    }
    if (!params.originCountryId.every((id) => typeof id === 'number' && Number.isInteger(id))) {
      throw new Error('originCountryId must be an array of integers if provided');
    }
    result.originCountryId = params.originCountryId as number[];
  }

  // Optional nationalCode (array of strings)
  if (params.nationalCode !== undefined) {
    if (!Array.isArray(params.nationalCode)) {
      throw new Error('nationalCode must be an array if provided');
    }
    if (!params.nationalCode.every((code) => typeof code === 'string')) {
      throw new Error('nationalCode must be an array of strings if provided');
    }
    result.nationalCode = params.nationalCode.map((code) => String(code).trim());
  }

  // Optional expoBusinessCategoryId (array of numbers)
  if (params.expoBusinessCategoryId !== undefined) {
    if (!Array.isArray(params.expoBusinessCategoryId)) {
      throw new Error('expoBusinessCategoryId must be an array if provided');
    }
    if (
      !params.expoBusinessCategoryId.every((id) => typeof id === 'number' && Number.isInteger(id))
    ) {
      throw new Error('expoBusinessCategoryId must be an array of integers if provided');
    }
    result.expoBusinessCategoryId = params.expoBusinessCategoryId as number[];
  }

  // Optional currencyId
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

  // Optional language
  if (params.language !== undefined) {
    if (typeof params.language !== 'string') {
      throw new Error('language must be a string if provided');
    }
    result.language = params.language.trim();
  }

  return result;
}

/**
 * Gets the businesses array from response
 * The API always returns businesses in the 'data.results' field
 */
function getBusinessesArray(response: SearchBusinessesInEventResponse): unknown[] {
  // The API response structure always has results as an array inside data
  if (response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }

  // Fallback: if results is missing or not an array, return empty array
  return [];
}

/**
 * Searches for businesses in a specific event on Arobid platform
 */
export async function searchBusinessesInEvent(
  client: ArobidClient,
  input: unknown
): Promise<SearchBusinessesInEventResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/event/get-business-by-event-id-mul-for-view-all';

    // Build request payload
    const payload: Record<string, unknown> = {
      eventId: validatedInput.eventId,
    };

    if (validatedInput.search) {
      payload.search = validatedInput.search;
    }

    if (validatedInput.pageSize !== undefined) {
      payload.pageSize = validatedInput.pageSize;
    }

    if (validatedInput.pageIndex !== undefined) {
      payload.pageIndex = validatedInput.pageIndex;
    }

    if (validatedInput.sortField) {
      payload.sortField = validatedInput.sortField;
      payload.SortField = validatedInput.sortField; // API seems to accept both
    }

    if (validatedInput.asc !== undefined) {
      payload.asc = validatedInput.asc;
      payload.Asc = validatedInput.asc; // API seems to accept both
    }

    if (validatedInput.originCountryId !== undefined) {
      payload.originCountryId = validatedInput.originCountryId;
    }

    if (validatedInput.nationalCode !== undefined) {
      payload.nationalCode = validatedInput.nationalCode;
    }

    if (validatedInput.expoBusinessCategoryId !== undefined) {
      payload.expoBusinessCategoryId = validatedInput.expoBusinessCategoryId;
    }

    // Build custom headers for tradexpo API
    const customHeaders: Record<string, string> = {
      accept: 'application/json',
      'content-type': 'application/json',
    };

    if (validatedInput.currencyId !== undefined) {
      customHeaders['currencyid'] = validatedInput.currencyId.toString();
    } else {
      customHeaders['currencyid'] = '1';
    }

    if (validatedInput.language) {
      customHeaders['language'] = validatedInput.language;
    } else {
      customHeaders['language'] = 'en';
    }

    // Minimal logging for performance

    // Call Arobid Backend API with custom headers
    const response = await client.post<SearchBusinessesInEventResponse>(
      endpoint,
      payload,
      customHeaders
    );

    // Extract businesses array from data.results field
    const businesses = getBusinessesArray(response);
    const found = businesses.length > 0;

    // Use rowCount from API response as the total, fallback to businesses.length
    // rowCount represents the actual number of businesses in the current page
    const totalCount = response.data?.rowCount ?? businesses.length;

    // Add enhanced metadata to response for better clarity
    const enhancedResponse: SearchBusinessesInEventResponse = {
      ...response,
      found,
      total: totalCount,
    };

    // Minimal logging for performance

    return enhancedResponse;
  } catch (error) {
    // Handle Arobid-specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      throw new Error(
        `Failed to search businesses: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    throw new Error(
      `Failed to search businesses: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
