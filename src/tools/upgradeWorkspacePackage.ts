/**
 * MCP tool for upgrading workspace packages for a business/event
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

export interface UpgradeWorkspacePackageInput {
  id?: number;
  currencyId?: number;
  mainPackageIds?: number[];
  extraPackageIds?: number[];
  purchasedPackageIds?: number[];
  language?: string;
  requestId?: string;
  deviceId?: string;
}

export interface UpgradeWorkspacePackageResponse {
  [key: string]: unknown;
}

function validateInput(input: unknown): UpgradeWorkspacePackageInput {
  if (!input || typeof input !== 'object') {
    return {};
  }

  const params = input as Record<string, unknown>;
  const result: UpgradeWorkspacePackageInput = {};

  if (params.id !== undefined) {
    if (typeof params.id !== 'number' || !Number.isInteger(params.id)) {
      throw new Error('id must be an integer if provided');
    }
    result.id = params.id;
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

  const copyArray = (key: keyof UpgradeWorkspacePackageInput) => {
    const value = params[key as string];
    if (value === undefined) return;
    if (!Array.isArray(value) || !value.every((item) => typeof item === 'number')) {
      throw new Error(`${key as string} must be an array of integers if provided`);
    }
    result[key] = value as never;
  };

  copyArray('mainPackageIds');
  copyArray('extraPackageIds');
  copyArray('purchasedPackageIds');

  if (params.language !== undefined) {
    if (typeof params.language !== 'string') {
      throw new Error('language must be a string if provided');
    }
    result.language = params.language.trim();
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

function buildHeaders(input: UpgradeWorkspacePackageInput): Record<string, string> {
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

function buildQuery(input: UpgradeWorkspacePackageInput): string {
  const params = new URLSearchParams();
  if (input.id !== undefined) params.set('Id', input.id.toString());
  if (input.currencyId !== undefined) params.set('CurrencyId', input.currencyId.toString());

  const appendMulti = (key: string, values?: number[]) => {
    if (!values) return;
    for (const value of values) {
      params.append(key, value.toString());
    }
  };

  appendMulti('MainPackageIds', input.mainPackageIds);
  appendMulti('ExtraPackageIds', input.extraPackageIds);
  appendMulti('PurchasedPackageIds', input.purchasedPackageIds);

  return params.toString();
}

export async function upgradeWorkspacePackage(
  client: ArobidClient,
  input: unknown
): Promise<UpgradeWorkspacePackageResponse> {
  const validatedInput = validateInput(input);

  try {
    const query = buildQuery(validatedInput);
    const endpoint = `/tradexpo/api/workspace/upgrade-package${query ? `?${query}` : ''}`;
    const headers = buildHeaders(validatedInput);

    console.error(`[upgradeWorkspacePackage] Upgrading package for subscription ${validatedInput.id ?? 'N/A'}`);
    const response = await client.post<UpgradeWorkspacePackageResponse>(endpoint, {}, headers);
    console.error('[upgradeWorkspacePackage] Successfully upgraded package');
    return response;
  } catch (error) {
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[upgradeWorkspacePackage] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}`
      );
      throw new Error(
        `Failed to upgrade workspace package: ${arobidError.message}${
          arobidError.code ? ` (${arobidError.code})` : ''
        }`
      );
    }

    console.error(
      `[upgradeWorkspacePackage] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    throw new Error(
      `Failed to upgrade workspace package: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`
    );
  }
}


