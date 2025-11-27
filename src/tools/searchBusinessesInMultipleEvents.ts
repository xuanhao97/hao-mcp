/**
 * MCP tool for searching businesses across multiple events on Arobid platform
 * Processes events in batches and returns raw API responses for AI to process and make decisions
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
 * Error information for a failed event search
 */
export interface EventSearchError {
  eventId: string;
  error: string;
  statusCode?: number;
  code?: string;
}

/**
 * Response from searching businesses in multiple events
 * Returns raw data for AI to process and make decisions
 */
export interface SearchBusinessesInMultipleEventsResponse {
  resultsByEvent: Record<string, SearchBusinessesInEventResponse>;
  eventsProcessed: number;
  totalEvents: number;
  failedEvents: string[];
  errors?: EventSearchError[];
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
 * Searches for businesses across multiple events on Arobid platform
 * Processes events in batches and returns raw data for AI to process
 */
export async function searchBusinessesInMultipleEvents(
  client: ArobidClient,
  input: unknown
): Promise<SearchBusinessesInMultipleEventsResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const eventIds = validatedInput.eventIds;
    const batchSize = 20;
    const totalEvents = eventIds.length;

    const resultsByEvent: Record<string, SearchBusinessesInEventResponse> = {};
    const failedEvents: string[] = [];
    const errors: EventSearchError[] = [];
    let eventsProcessed = 0;

    // Process events in batches
    for (let i = 0; i < totalEvents; i += batchSize) {
      const batch = eventIds.slice(i, i + batchSize);

      // Process each event in the batch concurrently
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
          return { eventId, response, success: true, error: null };
        } catch (error) {
          // Extract detailed error information
          let errorMessage = 'Unknown error';
          let statusCode: number | undefined;
          let errorCode: string | undefined;

          if (error && typeof error === 'object') {
            if ('statusCode' in error) {
              statusCode = error.statusCode as number;
            }
            if ('code' in error) {
              errorCode = error.code as string;
            }
            if ('message' in error) {
              errorMessage = String(error.message);
            }
          } else if (error instanceof Error) {
            errorMessage = error.message;
          } else {
            errorMessage = String(error);
          }

          const errorInfo: EventSearchError = {
            eventId,
            error: errorMessage,
            statusCode,
            code: errorCode,
          };

          console.error(
            `[searchBusinessesInMultipleEvents] Failed to search event ${eventId}: ${errorMessage}${statusCode ? ` (HTTP ${statusCode})` : ''}${errorCode ? ` [${errorCode}]` : ''}`
          );

          return { eventId, response: null, success: false, error: errorInfo };
        }
      });

      // Wait for all events in the batch to complete
      const batchResults = await Promise.allSettled(batchPromises);

      // Collect results
      for (let i = 0; i < batchResults.length; i++) {
        const settledResult = batchResults[i];
        const eventId = batch[i];
        
        if (settledResult.status === 'fulfilled') {
          const result = settledResult.value;
          if (result.success && result.response) {
            resultsByEvent[result.eventId] = result.response;
            eventsProcessed++;
          } else {
            failedEvents.push(result.eventId);
            if (result.error) {
              errors.push(result.error);
            }
          }
        } else {
          // Handle promise rejection
          failedEvents.push(eventId);
          const errorMessage = settledResult.reason?.message || 
                              (settledResult.reason instanceof Error ? settledResult.reason.message : 'Promise rejected');
          errors.push({
            eventId,
            error: errorMessage,
          });
        }
      }
    }

    // Return raw data for AI to process
    const response: SearchBusinessesInMultipleEventsResponse = {
      resultsByEvent,
      eventsProcessed,
      totalEvents,
      failedEvents,
      errors: errors.length > 0 ? errors : undefined,
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
