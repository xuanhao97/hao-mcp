/**
 * MCP tool for user login in Arobid Backend
 * This can be used to retrieve a new OTP when the previous one has expired
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

/**
 * Input parameters for user login
 */
export interface UserLoginInput {
  email: string;
  password: string;
}

/**
 * Response from Arobid Backend after user login
 */
export interface UserLoginResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates input parameters for user login
 */
function validateInput(input: unknown): UserLoginInput {
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
    throw new Error('password is required and must be a non-empty string');
  }

  return {
    email: params.email.trim(),
    password: params.password,
  };
}

/**
 * Performs user login via Arobid Backend
 * This can be used to retrieve a new OTP when the previous one has expired
 */
export async function userLogin(
  client: ArobidClient,
  input: unknown
): Promise<UserLoginResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/api/user/user_login';

    // Prepare request payload matching the API structure
    const payload = {
      email: validatedInput.email,
      password: validatedInput.password,
    };

    // Log request details (without password)
    console.error(
      `[userLogin] API Request:\n` +
        `  Endpoint: ${endpoint}\n` +
        `  Payload: ${JSON.stringify({ ...payload, password: '***REDACTED***' }, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<UserLoginResponse>(endpoint, payload);

    console.error(
      `[userLogin] API Response:\n` +
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
        `[userLogin] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}\n` +
          `  Email: ${validatedInput.email}`
      );
      throw new Error(
        `Failed to login: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[userLogin] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `  Email: ${validatedInput.email}`
    );
    throw new Error(
      `Failed to login: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

