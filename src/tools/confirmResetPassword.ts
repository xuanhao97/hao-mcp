/**
 * MCP tool for confirming password reset in Arobid Backend
 * This should be used after checkResetPassword succeeds, using the OTP sent to the user's email
 */

import { ArobidClient, ArobidError } from '../client/arobidClient.js';
import { validateEmail, validateNonEmptyString } from '../utils/validation.js';

/**
 * Input parameters for confirming password reset
 */
export interface ConfirmResetPasswordInput {
  email: string;
  password: string;
  otp: string;
}

/**
 * Response from Arobid Backend after confirming password reset
 */
export interface ConfirmResetPasswordResponse {
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
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{}|;:'",.<>?/~]/.test(password);

  if (!hasLowercase || !hasUppercase || !hasNumber || !hasSpecialChar) {
    throw new Error(
      'Password must include at least one lowercase letter, one uppercase letter, one number, and one special character (!@#$%^&*()_+-=[]{}|;:\'",.<>?/~)'
    );
  }
}

/**
 * Validates input parameters for confirming password reset
 */
function validateInput(input: unknown): ConfirmResetPasswordInput {
  if (!input || typeof input !== 'object') {
    throw new Error('Input must be an object');
  }

  const params = input as Record<string, unknown>;

  // Required fields
  validateNonEmptyString(params.email, 'email');
  validateEmail(params.email, 'email');

  if (!params.password || typeof params.password !== 'string') {
    throw new Error('password is required');
  }
  validatePassword(params.password);

  validateNonEmptyString(params.otp, 'otp');

  // OTP validation: typically 6 digits
  const otpRegex = /^\d{6}$/;
  const otpString = params.otp as string;
  if (!otpRegex.test(otpString)) {
    throw new Error('otp must be exactly 6 digits');
  }

  return {
    email: (params.email as string).trim(),
    password: params.password,
    otp: (params.otp as string).trim(),
  };
}

/**
 * Confirms password reset via Arobid Backend
 * Use this after checkResetPassword succeeds, with the OTP sent to the user's email
 */
export async function confirmResetPassword(
  client: ArobidClient,
  input: unknown
): Promise<ConfirmResetPasswordResponse> {
  // Validate input
  const validatedInput = validateInput(input);

  try {
    const endpoint = '/b2b/api/user/reset_password_for_users';

    // Prepare request payload matching the API structure
    const payload = {
      email: validatedInput.email,
      password: validatedInput.password,
      otp: validatedInput.otp,
    };

    // Log request details (without password and OTP)
    console.error(
      `[confirmResetPassword] API Request:\n` +
        `  Payload: ${JSON.stringify({ ...payload, password: '***REDACTED***', otp: '***REDACTED***' }, null, 2)}`
    );

    // Call Arobid Backend API
    const response = await client.post<ConfirmResetPasswordResponse>(endpoint, payload);

    console.error(
      `[confirmResetPassword] API Response:\n` +
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
        `[confirmResetPassword] API Error:\n` +
          `  Status Code: ${arobidError.statusCode}\n` +
          `  Error Code: ${arobidError.code || 'N/A'}\n` +
          `  Message: ${arobidError.message}\n` +
          `  Email: ${validatedInput.email}`
      );
      throw new Error(
        `Failed to confirm password reset: ${arobidError.message}${arobidError.code ? ` (${arobidError.code})` : ''}`
      );
    }

    // Handle network or other errors
    console.error(
      `[confirmResetPassword] Unexpected Error:\n` +
        `  Type: ${error instanceof Error ? error.constructor.name : typeof error}\n` +
        `  Message: ${error instanceof Error ? error.message : 'Unknown error'}\n` +
        `  Email: ${validatedInput.email}`
    );
    throw new Error(
      `Failed to confirm password reset: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

