/**
 * MCP tool for updating business details within the workspace
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface FileModelInput {
  toggle?: boolean;
  url?: string[];
  type?: string;
}

export interface UpdateWorkspaceBusinessInput {
  eventId: number;
  expoBusinessId: number;
  video?: FileModelInput;
  banner?: FileModelInput;
  description?: string;
  supervisorName?: string;
  supervisorPhone?: string;
  language?: string;
  currencyId?: number;
  requestId?: string;
  deviceId?: string;
}

export interface UpdateWorkspaceBusinessResponse {
  [key: string]: unknown;
}

function validateFileModel(name: string, value: unknown): FileModelInput {
  if (!value || typeof value !== 'object') {
    throw new Error(`${name} must be an object if provided`);
  }

  const model = value as Record<string, unknown>;
  const result: FileModelInput = {};

  if (model.toggle !== undefined) {
    if (typeof model.toggle !== 'boolean') {
      throw new Error(`${name}.toggle must be a boolean if provided`);
    }
    result.toggle = model.toggle;
  }

  if (model.url !== undefined) {
    if (!Array.isArray(model.url) || !model.url.every((item) => typeof item === 'string')) {
      throw new Error(`${name}.url must be an array of strings if provided`);
    }
    result.url = model.url;
  }

  if (model.type !== undefined) {
    if (typeof model.type !== 'string') {
      throw new Error(`${name}.type must be a string if provided`);
    }
    result.type = model.type.trim();
  }

  return result;
}

function validateInput(input: unknown): UpdateWorkspaceBusinessInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  const requireInt = (key: string): number => {
    const value = params[key];
    if (typeof value !== 'number' || !Number.isInteger(value)) {
      throw new Error(`${key} is required and must be an integer`);
    }
    return value;
  };

  const result: UpdateWorkspaceBusinessInput = {
    eventId: requireInt('eventId'),
    expoBusinessId: requireInt('expoBusinessId'),
  };

  if (params.video !== undefined) {
    result.video = validateFileModel('video', params.video);
  }

  if (params.banner !== undefined) {
    result.banner = validateFileModel('banner', params.banner);
  }

  const copyOptionalString = (key: keyof UpdateWorkspaceBusinessInput) => {
    const value = params[key];
    if (value === undefined) return;
    if (typeof value !== 'string') {
      throw new Error(`${key as string} must be a string if provided`);
    }
    result[key] = value.trim() as never;
  };

  copyOptionalString('description');
  copyOptionalString('supervisorName');
  copyOptionalString('supervisorPhone');
  copyOptionalString('language');

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

function buildHeaders(input: UpdateWorkspaceBusinessInput): Record<string, string> {
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

function buildPayload(input: UpdateWorkspaceBusinessInput): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    eventId: input.eventId,
    expoBusinessId: input.expoBusinessId,
  };

  if (input.video) payload.video = input.video;
  if (input.banner) payload.banner = input.banner;
  if (input.description) payload.description = input.description;
  if (input.supervisorName) payload.supervisorName = input.supervisorName;
  if (input.supervisorPhone) payload.supervisorPhone = input.supervisorPhone;

  return payload;
}

export async function updateWorkspaceBusiness(
  client: ArobidClient,
  input: unknown
): Promise<UpdateWorkspaceBusinessResponse> {
  const validatedInput = validateInput(input);

  try {
    const headers = buildHeaders(validatedInput);
    const payload = buildPayload(validatedInput);
    const endpoint = '/tradexpo/api/workspace/update-business';

    console.error(
      `[updateWorkspaceBusiness] Updating business ${validatedInput.expoBusinessId} for event ${validatedInput.eventId}`
    );

    const response = await client.post<UpdateWorkspaceBusinessResponse>(endpoint, payload, headers);
    console.error('[updateWorkspaceBusiness] Successfully updated business');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[updateWorkspaceBusiness] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to update workspace business: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[updateWorkspaceBusiness] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to update workspace business: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}


