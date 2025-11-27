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

    // Build request payload matching the curl command structure
    // Always include filter arrays (even if empty) to match API expectations
    const payload: Record<string, unknown> = {
      eventId: validatedInput.eventId,
      originCountryId: validatedInput.originCountryId || [],
      nationalCode: validatedInput.nationalCode || [],
      expoBusinessCategoryId: validatedInput.expoBusinessCategoryId || [],
    };

    // Add optional fields
    if (validatedInput.search) {
      payload.search = validatedInput.search;
    }

    if (validatedInput.pageSize !== undefined) {
      payload.pageSize = validatedInput.pageSize;
    }

    if (validatedInput.pageIndex !== undefined) {
      payload.pageIndex = validatedInput.pageIndex;
    }

    // Handle sortField - API accepts both camelCase and PascalCase
    if (validatedInput.sortField) {
      payload.sortField = validatedInput.sortField;
      payload.SortField = validatedInput.sortField;
    }

    // Handle asc - API accepts both camelCase and PascalCase
    if (validatedInput.asc !== undefined) {
      payload.asc = validatedInput.asc;
      payload.Asc = validatedInput.asc;
    }

    // Build custom headers matching the curl command
    const customHeaders: Record<string, string> = {
      accept: 'application/json',
      'accept-language': validatedInput.language === 'vi' 
        ? 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7'
        : 'en-US,en;q=0.9,vi;q=0.8',
      'content-type': 'application/json',
    };

    // Currency ID header (default: 1)
    customHeaders['currencyid'] = validatedInput.currencyId?.toString() || '1';

    // Language header (default: en)
    customHeaders['language'] = validatedInput.language || 'en';

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
      const statusCode = arobidError.statusCode;
      const errorMessage = arobidError.message || 'Unknown error';
      const errorCode = arobidError.code;
      
      // Create detailed error message
      let detailedMessage = `Failed to search businesses in event "${validatedInput.eventId}": ${errorMessage}`;
      
      if (statusCode) {
        detailedMessage += ` (HTTP ${statusCode})`;
      }
      
      if (errorCode) {
        detailedMessage += ` [${errorCode}]`;
      }
      
      // Preserve error information for better debugging
      const enhancedError = new Error(detailedMessage);
      if (statusCode) {
        (enhancedError as unknown as { statusCode?: number }).statusCode = statusCode;
      }
      if (errorCode) {
        (enhancedError as unknown as { code?: string }).code = errorCode;
      }
      
      throw enhancedError;
    }

    // Handle network or other errors
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(
      `Failed to search businesses in event "${validatedInput.eventId}": ${errorMessage}`
    );
  }
}
