/**
 * MCP tool for getting detailed event information from Arobid platform
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

/**
 * Input parameters for getting event detail
 */
export interface GetEventDetailInput {
  eventId: string;
  currencyId?: number;
  language?: string;
}

/**
 * Response from Arobid Backend after getting event detail
 */
export interface GetEventDetailResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates input parameters for getting event detail
 */
function validateInput(input: unknown): GetEventDetailInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required eventId
  if (!params.eventId) {
    throw new Error('eventId is required');
  }
  if (typeof params.eventId !== 'string') {
    throw new Error('eventId must be a string');
  }
  const eventId = params.eventId.trim();
  if (!eventId) {
    throw new Error('eventId cannot be empty');
  }

  const result: GetEventDetailInput = {
    eventId,
  };

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
 * Gets detailed event information from Arobid platform
 */
export async function getEventDetail(
  client: ArobidClient,
  input: unknown
): Promise<GetEventDetailResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = `/tradexpo/api/v1/event/get-detail-event/${validatedInput.eventId}`;

    // Build custom headers for tradexpo API
    const customHeaders: Record<string, string> = {
      accept: 'application/json',
      'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
    };

    if (validatedInput.currencyId !== undefined) {
      customHeaders['currencyid'] = validatedInput.currencyId.toString();
    } else {
      customHeaders['currencyid'] = '1'; // Default currency ID
    }

    if (validatedInput.language) {
      customHeaders['language'] = validatedInput.language;
    } else {
      customHeaders['language'] = 'en'; // Default language
    }

    console.error(
      `[getEventDetail] Fetching event detail:\n` +
        `  Event ID: ${validatedInput.eventId}\n` +
        `  Currency ID: ${customHeaders['currencyid']}\n` +
        `  Language: ${customHeaders['language']}`
    );

    const response = await client.get<GetEventDetailResponse>(endpoint, customHeaders);

    console.error(
      `[getEventDetail] Successfully fetched event detail for event ID: ${validatedInput.eventId}`
    );

    return response;
  } catch (error) {
    // Handle Arobid-specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[getEventDetail] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to get event detail: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[getEventDetail] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to get event detail: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

