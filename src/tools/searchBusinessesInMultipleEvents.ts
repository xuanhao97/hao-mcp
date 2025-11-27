/**
 * MCP tool for searching businesses across multiple events on Arobid platform
 * Processes events in batches of 10 to efficiently search businesses
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import {
  searchBusinessesInEvent,
  SearchBusinessesInEventInput,
  SearchBusinessesInEventResponse,
} from './searchBusinessesInEvent.js';

/**
 * Input parameters for searching businesses in multiple events
 */
export interface SearchBusinessesInMultipleEventsInput {
  eventIds: string[];
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
 * Response from searching businesses in multiple events
 */
export interface SearchBusinessesInMultipleEventsResponse {
  businesses: unknown[];
  totalBusinesses: number;
  eventsProcessed: number;
  batchesProcessed: number;
  resultsByEvent: Record<string, unknown[]>;
  searchTerm?: string;
  found: boolean;
  businessNames: string[];
  summary: string;
  [key: string]: unknown;
}

/**
 * Validates input parameters for searching businesses in multiple events
 */
function validateInput(input: unknown): SearchBusinessesInMultipleEventsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required field: eventIds (array of strings)
  if (!params.eventIds) {
    throw new Error('eventIds is required and must be an array of event IDs');
  }

  if (!Array.isArray(params.eventIds)) {
    throw new Error('eventIds must be an array');
  }

  if (params.eventIds.length === 0) {
    throw new Error('eventIds must contain at least one event ID');
  }

  if (!params.eventIds.every((id) => typeof id === 'string' && id.trim().length > 0)) {
    throw new Error('eventIds must be an array of non-empty strings');
  }

  const result: SearchBusinessesInMultipleEventsInput = {
    eventIds: (params.eventIds as string[]).map((id) => String(id).trim()),
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

  // Fallback: if results is missing or not an array, log and return empty array
  console.error(
    `[getBusinessesArray] Expected 'data.results' array in response but got: ${typeof response.data?.results}. Response keys: ${Object.keys(response).join(', ')}`
  );
  return [];
}

/**
 * Searches for businesses across multiple events on Arobid platform
 * Processes events in batches of 10 to efficiently search businesses
 */
export async function searchBusinessesInMultipleEvents(
  client: ArobidClient,
  input: unknown
): Promise<SearchBusinessesInMultipleEventsResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const eventIds = validatedInput.eventIds;
    const batchSize = 20; // Increased batch size for faster processing
    const totalEvents = eventIds.length;

    const allBusinesses: unknown[] = [];
    const resultsByEvent: Record<string, unknown[]> = {};
    let eventsProcessed = 0;
    let batchesProcessed = 0;

    // Process events in batches of 10
    for (let i = 0; i < totalEvents; i += batchSize) {
      const batch = eventIds.slice(i, i + batchSize);

      // Process each event in the batch
      const batchPromises = batch.map(async (eventId) => {
        try {
          // Build input for searchBusinessesInEvent
          const eventInput: SearchBusinessesInEventInput = {
            eventId,
            search: validatedInput.search,
            pageSize: validatedInput.pageSize,
            pageIndex: validatedInput.pageIndex,
            sortField: validatedInput.sortField,
            asc: validatedInput.asc,
            originCountryId: validatedInput.originCountryId,
            nationalCode: validatedInput.nationalCode,
            expoBusinessCategoryId: validatedInput.expoBusinessCategoryId,
            currencyId: validatedInput.currencyId,
            language: validatedInput.language,
          };

          const response = await searchBusinessesInEvent(client, eventInput);
          const businesses = getBusinessesArray(response);

          return { eventId, businesses, success: true };
        } catch (error) {
          // Silently skip failed events to speed up processing
          return { eventId, businesses: [], success: false };
        }
      });

      // Wait for all events in the batch to complete (using allSettled to handle individual failures)
      // This ensures that if one event fails, others can still succeed and return results
      const batchSettledResults = await Promise.allSettled(batchPromises);

      // Extract results from settled promises
      const batchResults = batchSettledResults.map((settledResult, index) => {
        if (settledResult.status === 'fulfilled') {
          return settledResult.value;
        } else {
          // Silently handle promise rejections
          const eventId = batch[index] || 'unknown';
          return { eventId, businesses: [], success: false };
        }
      });

      // Collect results
      for (const result of batchResults) {
        if (result.success) {
          allBusinesses.push(...result.businesses);
          resultsByEvent[result.eventId] = result.businesses;
          eventsProcessed++;
        }
      }

      batchesProcessed++;
    }

    // Only extract business names if search term is provided (for quick reference)
    const businessNames: string[] = [];
    const searchTerm = validatedInput.search || '';
    const found = allBusinesses.length > 0;

    // Only extract names if we have a search term and results (for quick verification)
    if (searchTerm && found && allBusinesses.length <= 50) {
      for (const business of allBusinesses) {
        if (business && typeof business === 'object') {
          const biz = business as Record<string, unknown>;
          const name =
            biz.name ||
            biz.businessName ||
            biz.companyName ||
            biz.title ||
            biz.fullName ||
            biz.organizationName;
          if (name && typeof name === 'string') {
            businessNames.push(name);
          }
        }
      }
    }

    // Minimal summary for performance
    const summary = found
      ? `Found ${allBusinesses.length} business(es)${searchTerm ? ` matching "${searchTerm}"` : ''}`
      : `No businesses found${searchTerm ? ` matching "${searchTerm}"` : ''} across ${eventsProcessed} event(s)`;

    const response: SearchBusinessesInMultipleEventsResponse = {
      businesses: allBusinesses,
      totalBusinesses: allBusinesses.length,
      eventsProcessed,
      batchesProcessed,
      resultsByEvent,
      searchTerm: validatedInput.search,
      found,
      businessNames,
      summary,
    };

    return response;
  } catch (error) {
    // Handle errors
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
