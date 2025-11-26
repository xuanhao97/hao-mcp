/**
 * MCP tool for verifying a user account in Arobid Backend
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { validateEmail, validateNonEmptyString } from '../utils/validation.js';

/**
 * Input parameters for verifying a user account
 */
export interface VerifyUserInput {
  userEmail: string;
  otp: string;
}

/**
 * Response from Arobid Backend after verifying a user
 */
export interface VerifyUserResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates input parameters for verifying a user account
 */
function validateInput(input: unknown): VerifyUserInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required fields
  validateNonEmptyString(params.userEmail, 'userEmail');
  validateEmail(params.userEmail, 'userEmail');

  validateNonEmptyString(params.otp, 'otp');

  // OTP validation: typically 6 digits
  const otpRegex = /^\d{6}$/;
  const otpString = params.otp as string;
  if (!otpRegex.test(otpString)) {
    throw new Error('otp must be exactly 6 digits');
  }

  return {
    userEmail: (params.userEmail as string).trim(),
    otp: (params.otp as string).trim(),
  };
}

/**
 * Verifies a user account via Arobid Backend
 */
export async function verifyUser(
  client: ArobidClient,
  input: unknown
): Promise<VerifyUserResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/api/user/verify_user';

    // Prepare request payload matching the API structure
    const payload = {
      userEmail: validatedInput.userEmail,
      otp: validatedInput.otp,
    };

    // Log request details
    console.error(
      `[verifyUser] API Request:\n` +
        `  Endpoint: ${endpoint}\n` +
        `  Payload: ${JSON.stringify({ ...payload, otp: '***REDACTED***' }, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<VerifyUserResponse>(endpoint, payload);

    console.error(
      `[verifyUser] API Response:\n` +
        `  Status: Success\n` +
        `  Email: ${validatedInput.userEmail}\n` +
        `  Response: ${JSON.stringify(response, null, 2)}`
    );

    return response;
  } catch (error) {
    // Handle Arobid-specific errors
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const arobidError = error as ArobidError;
      console.error(
        `[verifyUser] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}\n` +
          `  Email: ${validatedInput.userEmail}`
      );
      throw new Error(
        `Failed to verify user: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[verifyUser] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `  Email: ${validatedInput.userEmail}`
    );
    throw new Error(
      `Failed to verify user: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
