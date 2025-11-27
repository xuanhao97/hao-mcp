/**
 * MCP tool for finding which events a business has participated in on Arobid.
 * Combines event discovery (by search term or explicit IDs) with a batched
 * business lookup across those events.
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { SearchEventsResponse } from './searchEvents.js';
import {
  searchBusinessesInMultipleEvents,
  SearchBusinessesInMultipleEventsResponse,
} from './searchBusinessesInMultipleEvents.js';

/**
 * Input parameters for the event participation lookup.
 */
export interface FindBusinessEventParticipationInput {
  businessName: string;
  eventIds?: string[];
  eventSearch?: string;
  maxEvents?: number;
  eventPageSize?: number;
  eventPageIndex?: number;
  eventSortField?: string;
  eventAsc?: boolean;
  businessPageSize?: number;
  businessPageIndex?: number;
  businessSortField?: string;
  businessAsc?: boolean;
  originCountryId?: number[];
  nationalCode?: string[];
  expoBusinessCategoryId?: number[];
  currencyId?: number;
  language?: string;
}

/**
 * Normalized event metadata retained for quick lookups.
 */
export interface EventMetadata {
  eventId: string;
  name?: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  raw: unknown;
}

/**
 * Business match information for a specific event.
 */
export interface BusinessMatch {
  businessId?: string;
  name?: string;
  raw: unknown;
}

/**
 * Response returned to the MCP caller.
 */
export interface FindBusinessEventParticipationResponse {
  businessName: string;
  normalizedBusinessName: string;
  found: boolean;
  matchedEvents: Array<{
    eventId: string;
    eventName?: string;
    startTime?: string;
    endTime?: string;
    location?: string;
    matchedBusinesses: BusinessMatch[];
    totalBusinessesInEvent: number;
  }>;
  eventsScanned: number;
  eventsWithMatches: number;
  eventsSource: 'provided' | 'discovered';
  unmatchedEventIds: string[];
  summary: string;
  searchContext: {
    eventSearch?: string;
    maxEvents: number;
    pagesLoaded: number;
    businessSearch: {
      pageSize: number;
      pageIndex?: number;
      sortField?: string;
      asc?: boolean;
    };
  };
}

/**
 * Validates and normalizes user input.
 */
function validateInput(
  input: unknown
): Required<Pick<FindBusinessEventParticipationInput, 'businessName'>> &
  FindBusinessEventParticipationInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  if (
    !params.businessName ||
    typeof params.businessName !== 'string' ||
    params.businessName.trim().length === 0
  ) {
    throw new Error('businessName is required');
  }

  const validated: FindBusinessEventParticipationInput = {
    businessName: params.businessName.trim(),
  };

  if (params.eventIds !== undefined) {
    if (
      !Array.isArray(params.eventIds) ||
      params.eventIds.some((value) => typeof value !== 'string' || !value.trim())
    ) {
      throw new Error('eventIds must be an array of non-empty strings if provided');
    }
    validated.eventIds = params.eventIds.map((value) => value.trim());
  }

  if (params.eventSearch !== undefined) {
    if (typeof params.eventSearch !== 'string') {
      throw new Error('eventSearch must be a string if provided');
    }
    validated.eventSearch = params.eventSearch.trim();
  }

  if (params.maxEvents !== undefined) {
    if (
      typeof params.maxEvents !== 'number' ||
      !Number.isInteger(params.maxEvents) ||
      params.maxEvents < 1 ||
      params.maxEvents > 1000
    ) {
      throw new Error('maxEvents must be an integer between 1 and 1000 if provided');
    }
    validated.maxEvents = params.maxEvents;
  } else {
    validated.maxEvents = 200;
  }

  if (params.eventPageSize !== undefined) {
    if (
      typeof params.eventPageSize !== 'number' ||
      !Number.isInteger(params.eventPageSize) ||
      params.eventPageSize < 1
    ) {
      throw new Error('eventPageSize must be a positive integer if provided');
    }
    validated.eventPageSize = params.eventPageSize;
  }

  if (params.eventPageIndex !== undefined) {
    if (
      typeof params.eventPageIndex !== 'number' ||
      !Number.isInteger(params.eventPageIndex) ||
      params.eventPageIndex < 1
    ) {
      throw new Error('eventPageIndex must be an integer greater than or equal to 1 if provided');
    }
    validated.eventPageIndex = params.eventPageIndex;
  }

  if (params.businessPageSize !== undefined) {
    if (
      typeof params.businessPageSize !== 'number' ||
      !Number.isInteger(params.businessPageSize) ||
      params.businessPageSize < 1
    ) {
      throw new Error('businessPageSize must be a positive integer if provided');
    }
    validated.businessPageSize = params.businessPageSize;
  }

  if (params.businessPageIndex !== undefined) {
    if (
      typeof params.businessPageIndex !== 'number' ||
      !Number.isInteger(params.businessPageIndex) ||
      params.businessPageIndex < 0
    ) {
      throw new Error('businessPageIndex must be a non-negative integer if provided');
    }
    validated.businessPageIndex = params.businessPageIndex;
  }

  if (params.eventAsc !== undefined) {
    if (typeof params.eventAsc !== 'boolean') {
      throw new Error('eventAsc must be a boolean if provided');
    }
    validated.eventAsc = params.eventAsc;
  }

  if (params.businessAsc !== undefined) {
    if (typeof params.businessAsc !== 'boolean') {
      throw new Error('businessAsc must be a boolean if provided');
    }
    validated.businessAsc = params.businessAsc;
  }

  if (params.eventSortField !== undefined) {
    if (typeof params.eventSortField !== 'string') {
      throw new Error('eventSortField must be a string if provided');
    }
    validated.eventSortField = params.eventSortField.trim();
  }

  if (params.businessSortField !== undefined) {
    if (typeof params.businessSortField !== 'string') {
      throw new Error('businessSortField must be a string if provided');
    }
    validated.businessSortField = params.businessSortField.trim();
  }

  if (params.language !== undefined) {
    if (typeof params.language !== 'string') {
      throw new Error('language must be a string if provided');
    }
    validated.language = params.language.trim();
  }

  if (params.originCountryId !== undefined) {
    if (
      !Array.isArray(params.originCountryId) ||
      params.originCountryId.some((value) => typeof value !== 'number' || !Number.isInteger(value))
    ) {
      throw new Error('originCountryId must be an array of integers if provided');
    }
    validated.originCountryId = params.originCountryId;
  }

  if (params.expoBusinessCategoryId !== undefined) {
    if (
      !Array.isArray(params.expoBusinessCategoryId) ||
      params.expoBusinessCategoryId.some(
        (value) => typeof value !== 'number' || !Number.isInteger(value)
      )
    ) {
      throw new Error('expoBusinessCategoryId must be an array of integers if provided');
    }
    validated.expoBusinessCategoryId = params.expoBusinessCategoryId;
  }

  if (params.nationalCode !== undefined) {
    if (
      !Array.isArray(params.nationalCode) ||
      params.nationalCode.some((value) => typeof value !== 'string')
    ) {
      throw new Error('nationalCode must be an array of strings if provided');
    }
    validated.nationalCode = params.nationalCode.map((value) => value.trim());
  }

  if (params.currencyId !== undefined) {
    if (
      typeof params.currencyId !== 'number' ||
      !Number.isInteger(params.currencyId) ||
      params.currencyId < 1
    ) {
      throw new Error('currencyId must be a positive integer if provided');
    }
    validated.currencyId = params.currencyId;
  }

  return validated as Required<Pick<FindBusinessEventParticipationInput, 'businessName'>> &
    FindBusinessEventParticipationInput;
}

/**
 * Normalizes strings for robust comparisons (case + accents insensitive).
 */
function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Extracts an event ID from raw event data.
 */
function extractEventId(event: unknown): string | null {
  if (!event || typeof event !== 'object') {
    return null;
  }

  const candidateKeys = [
    'id',
    'eventId',
    'eventID',
    'Id',
    'event_id',
    'expoId',
    'expoID',
    'expo_id',
  ];
  for (const key of candidateKeys) {
    const value = (event as Record<string, unknown>)[key];
    if ((typeof value === 'string' || typeof value === 'number') && `${value}`.trim().length > 0) {
      return `${value}`.trim();
    }
  }

  return null;
}

function extractStringField(event: unknown, keys: string[]): string | undefined {
  if (!event || typeof event !== 'object') {
    return undefined;
  }
  for (const key of keys) {
    const value = (event as Record<string, unknown>)[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function buildEventMetadata(event: unknown): EventMetadata | null {
  const eventId = extractEventId(event);
  if (!eventId) {
    return null;
  }

  return {
    eventId,
    name: extractStringField(event, ['name', 'eventName', 'title']),
    startTime: extractStringField(event, ['startTime', 'startDate']),
    endTime: extractStringField(event, ['endTime', 'endDate']),
    location: extractStringField(event, ['location', 'address', 'venue']),
    raw: event,
  };
}

function extractEventsFromResponse(response: SearchEventsResponse): unknown[] {
  if (!response) {
    return [];
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }
  if (Array.isArray((response as Record<string, unknown>).items)) {
    return (response as Record<string, unknown>).items as unknown[];
  }
  if (Array.isArray((response as Record<string, unknown>).events)) {
    return (response as Record<string, unknown>).events as unknown[];
  }
  if (Array.isArray(response)) {
    return response as unknown[];
  }
  return [];
}

interface EventCollectionResult {
  eventIds: string[];
  metadataMap: Record<string, EventMetadata>;
  pagesLoaded: number;
  totalRawEvents: number;
}

async function fetchEventsPage(
  client: ArobidClient,
  options: {
    search?: string;
    pageSize: number;
    pageIndex: number;
    sortField?: string;
    asc?: boolean;
    currencyId?: number;
    language?: string;
  }
): Promise<SearchEventsResponse> {
  const queryParams = new URLSearchParams();

  if (options.search) {
    queryParams.append('search', options.search);
  }

  queryParams.append('pageSize', options.pageSize.toString());
  queryParams.append('pageIndex', options.pageIndex.toString());

  if (options.sortField) {
    queryParams.append('SortField', options.sortField);
  }
  if (options.asc !== undefined) {
    queryParams.append('Asc', options.asc.toString());
  }

  const endpoint = `/tradexpo/api/events${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

  const customHeaders: Record<string, string> = {
    accept: 'application/json',
    'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
    currencyid: options.currencyId?.toString() || '1',
    language: options.language || 'en',
  };

  return client.get<SearchEventsResponse>(endpoint, customHeaders);
}

async function collectEventCandidates(
  client: ArobidClient,
  options: {
    search?: string;
    maxEvents: number;
    pageSize: number;
    pageIndex: number;
    sortField?: string;
    asc?: boolean;
    currencyId?: number;
    language?: string;
  }
): Promise<EventCollectionResult> {
  const metadataMap: Record<string, EventMetadata> = {};
  const eventIds: string[] = [];
  const seenEventIds = new Set<string>();

  let currentPage = options.pageIndex;
  let pagesLoaded = 0;
  let totalRawEvents = 0;
  const maxPages = 100; // safety guard

  while (eventIds.length < options.maxEvents && pagesLoaded < maxPages) {
    const response = await fetchEventsPage(client, {
      search: options.search,
      pageSize: options.pageSize,
      pageIndex: currentPage,
      sortField: options.sortField,
      asc: options.asc,
      currencyId: options.currencyId,
      language: options.language,
    });

    const rawEvents = extractEventsFromResponse(response);
    if (rawEvents.length === 0) {
      break;
    }

    totalRawEvents += rawEvents.length;

    for (const rawEvent of rawEvents) {
      if (eventIds.length >= options.maxEvents) {
        break;
      }

      const metadata = buildEventMetadata(rawEvent);
      if (!metadata || seenEventIds.has(metadata.eventId)) {
        continue;
      }

      seenEventIds.add(metadata.eventId);
      metadataMap[metadata.eventId] = metadata;
      eventIds.push(metadata.eventId);
    }

    pagesLoaded++;
    currentPage++;
  }

  return {
    eventIds,
    metadataMap,
    pagesLoaded,
    totalRawEvents,
  };
}

function extractBusinessName(business: Record<string, unknown>): string | undefined {
  const keys = [
    'name',
    'businessName',
    'companyName',
    'title',
    'fullName',
    'organizationName',
    'brandName',
    'tradingName',
  ];
  for (const key of keys) {
    const value = business[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }
  return undefined;
}

function extractBusinessId(business: Record<string, unknown>): string | undefined {
  const keys = ['id', 'businessId', 'companyId', 'profileId'];
  for (const key of keys) {
    const value = business[key];
    if ((typeof value === 'string' || typeof value === 'number') && `${value}`.trim()) {
      return `${value}`.trim();
    }
  }
  return undefined;
}

/**
 * Finds events that a business has participated in by scanning events and
 * searching for the business within each event's exhibitor list.
 */
export async function findBusinessEventParticipation(
  client: ArobidClient,
  input: unknown
): Promise<FindBusinessEventParticipationResponse> {
  const validated = validateInput(input);
  const normalizedBusinessName = normalizeText(validated.businessName);

  try {
    let eventIds: string[] = [];
    let metadataMap: Record<string, EventMetadata> = {};
    let pagesLoaded = 0;
    let eventsSource: 'provided' | 'discovered' = 'provided';

    if (validated.eventIds && validated.eventIds.length > 0) {
      eventIds = validated.eventIds;
      metadataMap = Object.fromEntries(
        eventIds.map((eventId) => [
          eventId,
          {
            eventId,
            raw: null,
          } as EventMetadata,
        ])
      );
    } else {
      eventsSource = 'discovered';
      const collection = await collectEventCandidates(client, {
        search: validated.eventSearch,
        maxEvents: validated.maxEvents || 200,
        pageSize: validated.eventPageSize || 200,
        pageIndex: validated.eventPageIndex || 1,
        sortField: validated.eventSortField,
        asc: validated.eventAsc,
        currencyId: validated.currencyId,
        language: validated.language,
      });

      eventIds = collection.eventIds;
      metadataMap = collection.metadataMap;
      pagesLoaded = collection.pagesLoaded;

      if (eventIds.length === 0) {
        return {
          businessName: validated.businessName,
          normalizedBusinessName,
          found: false,
          matchedEvents: [],
          eventsScanned: 0,
          eventsWithMatches: 0,
          eventsSource,
          unmatchedEventIds: [],
          summary: `No events found${validated.eventSearch ? ` for search "${validated.eventSearch}"` : ''}. Unable to check participation for ${validated.businessName}.`,
          searchContext: {
            eventSearch: validated.eventSearch,
            maxEvents: validated.maxEvents || 200,
            pagesLoaded,
            businessSearch: {
              pageSize: validated.businessPageSize || 1000,
              pageIndex: validated.businessPageIndex,
              sortField: validated.businessSortField,
              asc: validated.businessAsc,
            },
          },
        };
      }
    }

    const businessSearchResult: SearchBusinessesInMultipleEventsResponse =
      await searchBusinessesInMultipleEvents(client, {
        eventIds,
        search: validated.businessName,
        pageSize: validated.businessPageSize || 1000,
        pageIndex: validated.businessPageIndex,
        sortField: validated.businessSortField,
        asc: validated.businessAsc,
        originCountryId: validated.originCountryId,
        nationalCode: validated.nationalCode,
        expoBusinessCategoryId: validated.expoBusinessCategoryId,
        currencyId: validated.currencyId,
        language: validated.language,
      });

    const resultsByEvent = businessSearchResult.resultsByEvent || {};
    const matchedEvents: FindBusinessEventParticipationResponse['matchedEvents'] = [];
    const unmatchedEventIds: string[] = [];

    for (const eventId of eventIds) {
      const businessesForEvent = Array.isArray(resultsByEvent[eventId])
        ? resultsByEvent[eventId]
        : [];
      const matchedBusinesses: BusinessMatch[] = businessesForEvent.map((business) => {
        const businessRecord = business as Record<string, unknown>;
        return {
          businessId: extractBusinessId(businessRecord),
          name: extractBusinessName(businessRecord),
          raw: business,
        };
      });

      if (matchedBusinesses.length > 0) {
        const metadata = metadataMap[eventId] || { eventId, raw: null };
        matchedEvents.push({
          eventId,
          eventName: metadata.name,
          startTime: metadata.startTime,
          endTime: metadata.endTime,
          location: metadata.location,
          matchedBusinesses,
          totalBusinessesInEvent: businessesForEvent.length,
        });
      } else {
        unmatchedEventIds.push(eventId);
      }
    }

    const found = matchedEvents.length > 0;
    const summary = found
      ? `Found ${matchedEvents.length} event(s) containing a business matching "${validated.businessName}".`
      : `Business "${validated.businessName}" was not found in ${eventIds.length} scanned event(s).`;

    return {
      businessName: validated.businessName,
      normalizedBusinessName,
      found,
      matchedEvents,
      eventsScanned: eventIds.length,
      eventsWithMatches: matchedEvents.length,
      eventsSource,
      unmatchedEventIds,
      summary,
      searchContext: {
        eventSearch: validated.eventSearch,
        maxEvents: validated.maxEvents || 200,
        pagesLoaded,
        businessSearch: {
          pageSize: validated.businessPageSize || 1000,
          pageIndex: validated.businessPageIndex,
          sortField: validated.businessSortField,
          asc: validated.businessAsc,
        },
      },
    };
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      throw new Error(
        `Failed to find business participation: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    throw new Error(
      `Failed to find business participation: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
