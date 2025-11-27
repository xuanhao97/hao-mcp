/**
 * MCP tool for resending OTP to user email in Arobid Backend
 * This can be used when verifyUser fails due to expired or invalid OTP
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { validateEmail, validateNonEmptyString } from '../utils/validation.js';

/**
 * Input parameters for resending OTP
 */
export interface ResendOtpInput {
  userEmail: string;
}

/**
 * Response from Arobid Backend after resending OTP
 */
export interface ResendOtpResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates input parameters for resending OTP
 */
function validateInput(input: unknown): ResendOtpInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required fields
  validateNonEmptyString(params.userEmail, 'userEmail');
  validateEmail(params.userEmail, 'userEmail');

  return {
    userEmail: (params.userEmail as string).trim(),
  };
}

/**
 * Resends OTP to user email via Arobid Backend
 * Use this when verifyUser fails due to expired or invalid OTP
 */
export async function resendOtp(
  client: ArobidClient,
  input: unknown
): Promise<ResendOtpResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/b2b/api/user/resend_otp_for_user';

    // Prepare request payload matching the API structure
    const payload = {
      userEmail: validatedInput.userEmail,
    };

    // Log request details
    console.error(
      `[resendOtp] API Request:\n` +
        `  Payload: ${JSON.stringify(payload, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<ResendOtpResponse>(endpoint, payload);

    console.error(
      `[resendOtp] API Response:\n` +
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
        `[resendOtp] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}\n` +
          `  Email: ${validatedInput.userEmail}`
      );
      throw new Error(
        `Failed to resend OTP: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[resendOtp] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `  Email: ${validatedInput.userEmail}`
    );
    throw new Error(
      `Failed to resend OTP: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

