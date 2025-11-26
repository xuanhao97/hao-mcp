/**
 * MCP tool for creating a personal user account in Arobid Backend
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

/**
 * Input parameters for creating a personal account
 */
export interface CreatePersonalAccountInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  title?: string;
  phone?: string;
  national?: string;
}

/**
 * Response from Arobid Backend after creating an account
 */
export interface CreatePersonalAccountResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates password complexity
 */
function validatePassword(password: string): void {
  if (password.length < 6 || password.length > 20) {
    throw new Error('Password must be between 6 and 20 characters');
  }

  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[@$!%*?&]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
    throw new Error(
      'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character (@$!%*?&)'
    );
  }
}

/**
 * Validates phone number (Vietnamese or international format)
 */
function validatePhone(phone: string, national?: string): void {
  // Vietnamese phone regex: +84 or 0 followed by 9-10 digits
  const vnPhoneRegex = /^(\+84|0)(3|5|7|8|9)[0-9]{8}$/;
  // International phone regex (basic): + followed by country code and digits
  const intlPhoneRegex = /^\+[1-9]\d{1,14}$/;

  if (national === 'VN' || !national) {
    // If national is VN or not specified, validate as Vietnamese phone
    if (!vnPhoneRegex.test(phone)) {
      throw new Error(
        'Phone must be a valid Vietnamese phone number (+84XXXXXXXXX or 0XXXXXXXXX)'
      );
    }
  } else {
    // For other countries, validate as international format
    if (!intlPhoneRegex.test(phone)) {
      throw new Error('Phone must be in international format (+XXXXXXXXXXX)');
    }
  }
}

/**
 * Validates input parameters for creating a personal account
 */
function validateInput(input: unknown): CreatePersonalAccountInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required fields
  if (!params.email || typeof params.email !== 'string' || !params.email.trim()) {
    throw new Error('email is required and must be a non-empty string');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(params.email)) {
    throw new Error('email must be a valid email address');
  }

  if (!params.password || typeof params.password !== 'string') {
    throw new Error('password is required');
  }
  validatePassword(params.password);

  if (!params.firstName || typeof params.firstName !== 'string' || !params.firstName.trim()) {
    throw new Error('firstName is required and must be a non-empty string');
  }

  if (!params.lastName || typeof params.lastName !== 'string' || !params.lastName.trim()) {
    throw new Error('lastName is required and must be a non-empty string');
  }

  // Optional fields
  const result: CreatePersonalAccountInput = {
    email: params.email.trim(),
    password: params.password,
    firstName: params.firstName.trim(),
    lastName: params.lastName.trim(),
  };

  // Title validation: must be "Mr" or "Mrs", default to "Mr"
  if (params.title !== undefined) {
    if (typeof params.title !== 'string') {
      throw new Error('title must be a string if provided');
    }
    const title = params.title.trim();
    if (title !== 'Mr' && title !== 'Mrs') {
      throw new Error('title must be either "Mr" or "Mrs"');
    }
    result.title = title;
  } else {
    result.title = 'Mr'; // Default value
  }

  // National validation: must be 2-letter uppercase country code
  // Validate national first so we can use it for phone validation
  let nationalCode: string | undefined;
  if (params.national !== undefined) {
    if (typeof params.national !== 'string') {
      throw new Error('national must be a string if provided');
    }
    const national = params.national.trim().toUpperCase();
    if (!/^[A-Z]{2}$/.test(national)) {
      throw new Error('national must be a 2-letter uppercase country code (e.g., VN, US, AF)');
    }
    nationalCode = national;
    result.national = national;
  }

  // Phone validation (use national code if available)
  if (params.phone !== undefined) {
    if (typeof params.phone !== 'string') {
      throw new Error('phone must be a string if provided');
    }
    const phone = params.phone.trim();
    if (phone) {
      validatePhone(phone, nationalCode);
      result.phone = phone;
    }
  }

  return result;
}

/**
 * Creates a personal account via Arobid Backend
 */
export async function createPersonalAccount(
  client: ArobidClient,
  input: unknown
): Promise<CreatePersonalAccountResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    // TODO: Verify the exact endpoint path for account creation
    const endpoint = '/api/user/create_user_for_sign_up_async';

    // Prepare request payload matching the API structure
    // Title defaults to "Mr" if not provided
    const payload = {
      user: {
        email: validatedInput.email,
        password: validatedInput.password,
        first_name: validatedInput.firstName,
        last_name: validatedInput.lastName,
        title: validatedInput.title || 'Mr', // Default to "Mr"
        ...(validatedInput.phone && { phone: validatedInput.phone }),
        ...(validatedInput.national && { national: validatedInput.national }),
      },
    };

    // Log request details (without password)
    const logPayload = {
      ...payload,
      user: {
        ...payload.user,
        password: '***REDACTED***',
      },
    };
    console.error(
      `[createPersonalAccount] API Request:\n` +
      `  Endpoint: ${endpoint}\n` +
      `  Payload: ${JSON.stringify(logPayload, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<CreatePersonalAccountResponse>(endpoint, payload);

    console.error(
      `[createPersonalAccount] API Response:\n` +
      `  Status: Success\n` +
      `  Email: ${validatedInput.email}\n` +
      `  Response: ${JSON.stringify(response, null, 2)}`
    );

    return response;
  } catch (error) {
    // Handle Arobid-specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[createPersonalAccount] API Error:\n` +
        `  Status Code: ${arobidError.statusCode}\n` +
        `  Error Code: ${arobidError.code || 'N/A'}\n` +
        `  Message: ${arobidError.message}\n` +
        `  Email: ${validatedInput.email}`
      );
      throw new Error(
        `Failed to create account: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[createPersonalAccount] Unexpected Error:\n` +
      `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
      `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
      `  Email: ${validatedInput.email}`
    );
    throw new Error(
      `Failed to create account: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}


