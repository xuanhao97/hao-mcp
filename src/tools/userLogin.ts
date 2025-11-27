/**
 * MCP tool for user login in Arobid Backend
 * This can be used to retrieve a new OTP when the previous one has expired
 */

import { ArobidClient } from '../client/arobidClient.js';
import { validateEmail, validateNonEmptyString } from '../utils/validation.js';

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
  data: unknown | null;
  errorMessage?: string;
  errorCode?: number;
  isSucceeded: boolean;
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
  validateNonEmptyString(params.email, 'email');
  validateEmail(params.email, 'email');

  if (!params.password || typeof params.password !== 'string') {
    throw new Error('password is required and must be a non-empty string');
  }

  return {
    email: (params.email as string).trim(),
    password: params.password as string,
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

  const endpoint = '/b2b/api/user/user_login';

  // Prepare request payload matching the API structure
  const payload = {
    email: validatedInput.email,
    password: validatedInput.password,
  };

  // Log request details (without password)
  console.error(
    `[userLogin] API Request:\n` +
      `  Payload: ${JSON.stringify({ ...payload, password: '***REDACTED***' }, null, 2)}`
  );

  // Use postWithErrorBody to get the full response even for error status codes
  // This allows us to check for the special "OTP not verified" case
  const { body, status, ok } = await client.postWithErrorBody<UserLoginResponse>(endpoint, payload);

  if (ok) {
    // Success case
    console.error(
      `[userLogin] API Response:\n` +
        `  Status: Success\n` +
        `  Email: ${validatedInput.email}\n` +
        `  Response: ${JSON.stringify(body, null, 2)}`
    );

    return body;
  }

  // Error case - check if this is the special "OTP not verified" success case
  if (
    status === 400 &&
    body.errorCode === 5 
  ) {
    // This is actually a success - OTP was sent successfully
    console.error(
      `[userLogin] OTP sent successfully (errorCode 5):\n` +
        `  Email: ${validatedInput.email}\n` +
        `  Response: ${JSON.stringify(body, null, 2)}\n` +
        `  Note: OTP has been sent. Proceed to verify step.`
    );

    // Return the response indicating OTP was sent successfully
    return {
      ...body,
      _otpSent: true,
      _message: 'OTP has been sent successfully. Please proceed to verify step.',
    } as UserLoginResponse;
  }

  // Other error cases - throw an error
  const errorMessage = body.errorMessage || `HTTP ${status}: Bad Request`;
  const errorCode = body.errorCode?.toString();
  
  console.error(
    `[userLogin] API Error:\n` +
      `  Status Code: ${status}\n` +
      `  Error Code: ${errorCode || 'N/A'}\n` +
      `  Message: ${errorMessage}\n` +
      `  Email: ${validatedInput.email}`
  );
  
  throw new Error(
    `Failed to login: ${errorMessage}${errorCode ? ` (${errorCode})` : ''}`
  );
}

