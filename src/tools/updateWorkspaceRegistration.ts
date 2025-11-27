/**
 * MCP tool for updating registration forms within the workspace
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface UpdateWorkspaceRegistrationInput {
  id: number;
  prefix: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  email: string;
  position?: string;
  businessId?: number;
  businessName: string;
  description?: string;
  isCreateAccount?: boolean;
  isSubscribeNotifications?: boolean;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface UpdateWorkspaceRegistrationResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): UpdateWorkspaceRegistrationInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const requireString = (key: string): string => {
    const value = params[key];
    if (typeof value !== 'string' || !value.trim()) {
      throw new Error(`${key} is required and must be a non-empty string`);
    }
    return value.trim();
  };

  const requireInt = (key: string): number => {
    const value = params[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key} is required and must be an integer`);
    }
    return value;
  };

  const result: UpdateWorkspaceRegistrationInput = {
    id: requireInt('id'),
    prefix: requireString('prefix'),
    firstName: requireString('firstName'),
    lastName: requireString('lastName'),
    phoneNumber: requireString('phoneNumber'),
    email: requireString('email'),
    businessName: requireString('businessName'),
  };

  if (params.position !== undefined) {
    if (typeof params.position !== 'string') {
      throw new Error('position must be a string if provided');
    }
    result.position = params.position.trim();
  }

  if (params.businessId !== undefined) {
    if (typeof params.businessId !== 'number' || !Number.isInteger(params.businessId)) {
      throw new Error('businessId must be an integer if provided');
    }
    result.businessId = params.businessId;
  }

  if (params.description !== undefined) {
    if (typeof params.description !== 'string') {
      throw new Error('description must be a string if provided');
    }
    result.description = params.description.trim();
  }

  if (params.isCreateAccount !== undefined) {
    if (typeof params.isCreateAccount !== 'boolean') {
      throw new Error('isCreateAccount must be a boolean if provided');
    }
    result.isCreateAccount = params.isCreateAccount;
  }

  if (params.isSubscribeNotifications !== undefined) {
    if (typeof params.isSubscribeNotifications !== 'boolean') {
      throw new Error('isSubscribeNotifications must be a boolean if provided');
    }
    result.isSubscribeNotifications = params.isSubscribeNotifications;
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

function buildHeaders(input: UpdateWorkspaceRegistrationInput): Record<string, string> {
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

export async function updateWorkspaceRegistration(
  client: ArobidClient,
  input: unknown
): Promise<UpdateWorkspaceRegistrationResponse> {
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/tradexpo/api/workspace/update-form-registration';
    const headers = buildHeaders(validatedInput);

    console.error(`[updateWorkspaceRegistration] Updating registration ${validatedInput.id}`);

    const response = await client.put<UpdateWorkspaceRegistrationResponse>(endpoint, validatedInput, headers);
    console.error('[updateWorkspaceRegistration] Successfully updated registration');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[updateWorkspaceRegistration] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to update workspace registration: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[updateWorkspaceRegistration] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to update workspace registration: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}


