/**
 * Shared validator for submit form / preview order payloads
 */

export interface SubmitFormRequestInput {
  eventId: number;
  name?: string;
  status?: string;
  note?: string;
  prefix?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  email?: string;
  position?: string;
  businessName?: string;
  businessId?: number;
  taxCode?: string;
  businessType?: string;
  businessSector?: string[];
  interestCategory?: string[];
  visitPurpose?: string[];
  eventSource?: string;
  boothRegistration?: string;
  isCreateAccount?: boolean;
  isSubscribeNotifications?: boolean;
  mainPackageIds?: number[];
  extraPackageIds?: number[];
  purchasedPackageIds?: number[];
  eventDate?: string;
  couponCode?: string;
  partnerCode?: string;
  isAuthen?: boolean;
  currencyId?: number;
  language?: string;
  requestId?: string;
  deviceId?: string;
}

function ensureString(value: unknown, field: string): string {
  if (typeof value !== 'string') {
    throw new Error(`${field} must be a string if provided`);
  }
  return value.trim();
}

function ensureStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'string')) {
    throw new Error(`${field} must be an array of strings if provided`);
  }
  return value.map((item) => item.trim());
}

function ensureNumberArray(value: unknown, field: string): number[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === 'number')) {
    throw new Error(`${field} must be an array of numbers if provided`);
  }
  return value;
}

export function validateSubmitFormRequest(input: unknown): SubmitFormRequestInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;
  if (typeof params.eventId !== 'number' || !Number.isInteger(params.eventId)) {
    throw new Error('eventId is required and must be an integer');
  }

  const result: SubmitFormRequestInput = {
    eventId: params.eventId,
  };

  const optionalStrings: (keyof SubmitFormRequestInput)[] = [
    'name',
    'status',
    'note',
    'prefix',
    'firstName',
    'lastName',
    'phoneNumber',
    'email',
    'position',
    'businessName',
    'taxCode',
    'businessType',
    'eventSource',
    'boothRegistration',
    'eventDate',
    'couponCode',
    'partnerCode',
    'language',
  ];

  for (const key of optionalStrings) {
    if (params[key as string] !== undefined) {
      result[key] = ensureString(params[key as string], key as string) as never;
    }
  }

  if (params.businessId !== undefined) {
    if (typeof params.businessId !== 'number' || !Number.isInteger(params.businessId)) {
      throw new Error('businessId must be an integer if provided');
    }
    result.businessId = params.businessId;
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

  const boolFields: (keyof SubmitFormRequestInput)[] = [
    'isCreateAccount',
    'isSubscribeNotifications',
    'isAuthen',
  ];
  for (const key of boolFields) {
    if (params[key as string] !== undefined) {
      if (typeof params[key as string] !== 'boolean') {
        throw new Error(`${key as string} must be a boolean if provided`);
      }
      result[key] = params[key as string] as never;
    }
  }

  const stringArrayFields: (keyof SubmitFormRequestInput)[] = [
    'businessSector',
    'interestCategory',
    'visitPurpose',
  ];
  for (const key of stringArrayFields) {
    if (params[key as string] !== undefined) {
      result[key] = ensureStringArray(params[key as string], key as string) as never;
    }
  }

  const numberArrayFields: (keyof SubmitFormRequestInput)[] = [
    'mainPackageIds',
    'extraPackageIds',
    'purchasedPackageIds',
  ];
  for (const key of numberArrayFields) {
    if (params[key as string] !== undefined) {
      result[key] = ensureNumberArray(params[key as string], key as string) as never;
    }
  }

  if (params.requestId !== undefined) {
    result.requestId = ensureString(params.requestId, 'requestId');
  }
  if (params.deviceId !== undefined) {
    result.deviceId = ensureString(params.deviceId, 'deviceId');
  }

  return result;
}


