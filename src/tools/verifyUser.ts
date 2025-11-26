/**
 * MCP tool for verifying a user account in Arobid Backend
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';

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
  if (!params.userEmail || typeof params.userEmail !== 'string' || !params.userEmail.trim()) {
    throw new Error('userEmail is required and must be a non-empty string');
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(params.userEmail)) {
    throw new Error('userEmail must be a valid email address');
  }

  if (!params.otp || typeof params.otp !== 'string' || !params.otp.trim()) {
    throw new Error('otp is required and must be a non-empty string');
  }

  // OTP validation: typically 6 digits
  const otpRegex = /^\d{6}$/;
  if (!otpRegex.test(params.otp)) {
    throw new Error('otp must be exactly 6 digits');
  }

  return {
    userEmail: params.userEmail.trim(),
    otp: params.otp.trim(),
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

