/**
 * MCP tool for searching active exhibitions/events on Arobid platform
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

/**
 * Input parameters for searching events
 */
export interface SearchEventsInput {
  search?: string;
  pageSize?: number;
  pageIndex?: number;
  sortField?: string;
  asc?: boolean;
  currencyId?: number;
  language?: string;
}

/**
 * Response from Arobid Backend after searching events
 */
export interface SearchEventsResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  data?: unknown[];
  items?: unknown[];
  events?: unknown[];
  [key: string]: unknown;
}

/**
 * Validates input parameters for searching events
 */
function validateInput(input: unknown): SearchEventsInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const result: SearchEventsInput = {};

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
 * Gets the events array from response (handles different response structures)
 */
function getEventsArray(response: SearchEventsResponse): unknown[] {
  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray(response.items)) {
    return response.items;
  }
  if (Array.isArray(response.events)) {
    return response.events;
  }
  if (Array.isArray(response)) {
    return response;
  }
  return [];
}

/**
 * Makes a single API request to search events
 */
async function fetchEventsPage(
  client: ArobidClient,
  validatedInput: SearchEventsInput,
  pageIndex: number
): Promise<SearchEventsResponse> {
  // Build query parameters
  const queryParams = new URLSearchParams();

  if (validatedInput.search) {
    queryParams.append('search', validatedInput.search);
  }

  queryParams.append('pageSize', (validatedInput.pageSize || 1000).toString());
  queryParams.append('pageIndex', pageIndex.toString());

  if (validatedInput.sortField) {
    queryParams.append('SortField', validatedInput.sortField);
  }

  if (validatedInput.asc !== undefined) {
    queryParams.append('Asc', validatedInput.asc.toString());
  }

  const queryString = queryParams.toString();
  const endpoint = `/tradexpo/api/events${queryString ? `?${queryString}` : ''}`;

  // Build custom headers for tradexpo API
  const customHeaders: Record<string, string> = {
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
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

  return client.get<SearchEventsResponse>(endpoint, customHeaders);
}

/**
 * Searches for active exhibitions/events on Arobid platform
 * Crawls all pages until no more events are found before returning results
 */
export async function searchEvents(
  client: ArobidClient,
  input: unknown
): Promise<SearchEventsResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const startPageIndex = validatedInput.pageIndex || 1;
    let currentPageIndex = startPageIndex;
    let allEvents: unknown[] = [];
    let lastResponse: SearchEventsResponse | null = null;
    const maxPagesToLoad = 1000; // Safety limit to prevent infinite loops
    let pagesLoaded = 0;

    // Load initial page
    console.error(
      `[searchEvents] Starting crawl:\n` +
        `  Search: ${validatedInput.search || 'N/A'}\n` +
        `  PageSize: ${validatedInput.pageSize || 1000}\n` +
        `  Starting from PageIndex: ${currentPageIndex}`
    );

    // Crawl all pages until no more events are found
    while (pagesLoaded < maxPagesToLoad) {
      console.error(`[searchEvents] Loading page ${currentPageIndex}...`);

      const response = await fetchEventsPage(client, validatedInput, currentPageIndex);
      const events = getEventsArray(response);

      if (events.length === 0) {
        // No more events, stop crawling
        console.error(`[searchEvents] Page ${currentPageIndex} returned 0 events. Stopping crawl.`);
        break;
      }

      // Add events to the collection
      allEvents = [...allEvents, ...events];
      lastResponse = response;
      pagesLoaded++;

      console.error(
        `[searchEvents] Page ${currentPageIndex} loaded: ${events.length} events (Total so far: ${allEvents.length})`
      );

      // Move to next page
      currentPageIndex++;
    }

    if (pagesLoaded >= maxPagesToLoad) {
      console.error(
        `[searchEvents] WARNING: Reached maximum page limit (${maxPagesToLoad}). Stopping crawl.`
      );
    }

    // Merge all events into the response
    const finalResponse: SearchEventsResponse = lastResponse
      ? { ...lastResponse }
      : {
          data: [],
        };

    // Update the events array in the response
    if (Array.isArray(finalResponse.data)) {
      finalResponse.data = allEvents;
    } else if (Array.isArray(finalResponse.items)) {
      finalResponse.items = allEvents;
    } else if (Array.isArray(finalResponse.events)) {
      finalResponse.events = allEvents;
    } else {
      // If response structure is unknown, use data field
      finalResponse.data = allEvents;
    }

    // Add metadata about pagination
    finalResponse._pagination = {
      totalPagesLoaded: pagesLoaded,
      startPageIndex,
      endPageIndex: currentPageIndex - 1, // Subtract 1 because we incremented before checking
      totalEvents: allEvents.length,
    };

    console.error(
      `[searchEvents] Crawl completed:\n` +
        `  Status: Success\n` +
        `  Pages loaded: ${pagesLoaded}\n` +
        `  Total events: ${allEvents.length}\n` +
        `  Page range: ${startPageIndex} to ${currentPageIndex - 1}`
    );

    return finalResponse;
  } catch (error) {
    // Handle Arobid-specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[searchEvents] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to search events: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[searchEvents] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to search events: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
