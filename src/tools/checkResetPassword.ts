/**
 * MCP tool for checking/resetting password in Arobid Backend
 * This initiates the password reset or change password process by sending a reset link/OTP to the user's email.
 * 
 * Use cases:
 * 1. Password Reset: When a user has forgotten their password and needs to reset it
 * 2. Change Password: When a user wants to change their existing password for security reasons
 * 
 * Both scenarios follow the same flow:
 * - This tool sends an OTP to the user's email
 * - Use confirmResetPassword to complete the process with the new password and OTP
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { validateEmail, validateNonEmptyString } from '../utils/validation.js';

/**
 * Input parameters for checking/resetting password
 */
export interface CheckResetPasswordInput {
  email: string;
}

/**
 * Response from Arobid Backend after checking reset password
 */
export interface CheckResetPasswordResponse {
  // TODO: Update with actual response structure from Arobid Backend API
  [key: string]: unknown;
}

/**
 * Validates input parameters for checking reset password
 */
function validateInput(input: unknown): CheckResetPasswordInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required fields
  validateNonEmptyString(params.email, 'email');
  validateEmail(params.email, 'email');

  return {
    email: (params.email as string).trim(),
  };
}

/**
 * Initiates password reset or change password process via Arobid Backend
 * This will send a reset link or OTP to the user's email.
 * 
 * Supports both scenarios:
 * - Password reset (when user forgot password)
 * - Change password (when user wants to update existing password)
 * 
 * After calling this, use confirmResetPassword with the OTP received via email to complete the process.
 */
export async function checkResetPassword(
  client: ArobidClient,
  input: unknown
): Promise<CheckResetPasswordResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/b2b/api/user/check_reset_password';

    // Prepare request payload matching the API structure
    const payload = {
      email: validatedInput.email,
    };

    // Log request details
    console.error(
      `[checkResetPassword] API Request:\n` +
        `  Endpoint: ${endpoint}\n` +
        `  Payload: ${JSON.stringify(payload, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<CheckResetPasswordResponse>(endpoint, payload);

    console.error(
      `[checkResetPassword] API Response:\n` +
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
        `[checkResetPassword] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}\n` +
          `  Email: ${validatedInput.email}`
      );
      throw new Error(
        `Failed to reset password: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[checkResetPassword] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `  Email: ${validatedInput.email}`
    );
    throw new Error(
      `Failed to reset password: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

