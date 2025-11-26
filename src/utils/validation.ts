/**
 * Validation utilities for Arobid MCP tools
 * Contains shared validation functions and regex patterns
 */

/**
 * Email validation regex pattern
 */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Validates an email address
 * @param email - Email address to validate
 * @param fieldName - Name of the field for error messages (default: 'email')
 * @throws Error if email is invalid
 */
export function validateEmail(email: unknown, fieldName: string = 'email'): void {
  if (typeof email !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }
  if (!EMAIL_REGEX.test(email)) {
    throw new Error(`${fieldName} must be a valid email address`);
  }
}

/**
 * Validates that a string is non-empty after trimming
 * @param value - Value to validate
 * @param fieldName - Name of the field for error messages
 * @throws Error if value is empty
 */
export function validateNonEmptyString(value: unknown, fieldName: string): void {
  if (!value || typeof value !== 'string' || !value.trim()) {
    throw new Error(`${fieldName} is required and must be a non-empty string`);
  }
}

