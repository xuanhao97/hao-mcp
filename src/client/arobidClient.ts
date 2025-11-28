/**
 * HTTP client for interacting with Arobid Backend API
 */

import { formatHttpStatus } from '../utils/httpStatusCodes.js';

export interface ArobidClientConfig {
  baseUrl: string;
  apiKey?: string;
  tenantId?: string;
}

export interface ArobidError {
  message: string;
  code?: string;
  statusCode?: number;
}

/**
 * Lightweight HTTP client wrapper for Arobid Backend
 */
export class ArobidClient {
  private baseUrl: string;
  private apiKey?: string;
  private tenantId?: string;

  constructor(config: ArobidClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.apiKey = config.apiKey;
    this.tenantId = config.tenantId;
  }

  /**
   * Builds request headers with authentication and common headers
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (this.apiKey) {
      // TODO: Verify the exact header name expected by Arobid Backend
      // Common patterns: 'Authorization: Bearer <key>', 'X-API-Key: <key>', 'Authorization: <key>'
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    if (this.tenantId) {
      // TODO: Verify if tenant ID is required and the exact header name
      headers['X-Tenant-ID'] = this.tenantId;
    }

    return headers;
  }

  /**
   * Builds the full URL from path
   * If path is already a full URL (starts with http:// or https://), returns it as-is
   * Otherwise, prepends the baseUrl
   */
  private buildUrl(path: string): string {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }
    return `${this.baseUrl}${path}`;
  }

  /**
   * Converts HTTP errors to ArobidError format
   */
  private async handleError(response: Response): Promise<ArobidError> {
    const statusDescription = formatHttpStatus(response.status, 'en');
    let errorMessage = `HTTP ${statusDescription}`;
    let errorCode: string | undefined;

    try {
      const errorBody = (await response.json()) as Record<string, unknown>;
      if (errorBody && typeof errorBody === 'object') {
        const apiMessage =
          (typeof errorBody.message === 'string' ? errorBody.message : null) ||
          (typeof errorBody.error === 'string' ? errorBody.error : null);

        if (apiMessage) {
          errorMessage = `${apiMessage} (${statusDescription})`;
        } else {
          errorMessage = statusDescription;
        }

        errorCode =
          (typeof errorBody.code === 'string' ? errorBody.code : null) ||
          (typeof errorBody.errorCode === 'string' ? errorBody.errorCode : null) ||
          undefined;
      }
    } catch {
      // If response is not JSON, use status text
      const text = await response.text().catch(() => '');
      if (text) {
        errorMessage = `${text} (${statusDescription})`;
      } else {
        errorMessage = statusDescription;
      }
    }

    return {
      message: errorMessage,
      code: errorCode,
      statusCode: response.status,
    };
  }

  /**
   * Performs a GET request
   * @param path - The API path or full URL
   * @param customHeaders - Optional custom headers to merge with default headers
   */
  async get<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path);
    const headers = { ...this.getHeaders(), ...customHeaders };
    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a POST request
   * @param path - The API path or full URL
   * @param data - The request body data
   * @param customHeaders - Optional custom headers to merge with default headers
   */
  async post<T>(path: string, data: unknown, customHeaders?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path);
    const headers = { ...this.getHeaders(), ...customHeaders };

    const bodyString = JSON.stringify(data);

    // Log request details
    console.log('[DEBUG] POST Request:', {
      url,
      method: 'POST',
      headers,
      body: bodyString,
    });

    // Generate and log curl command for debugging
    const curlHeaders = Object.entries(headers)
      .map(([key, value]) => {
        // Escape single quotes in header values
        const escapedValue = value.replace(/'/g, "'\\''");
        return `-H '${key}: ${escapedValue}'`;
      })
      .join(' ');

    // Escape body for curl: replace single quotes and escape properly
    const escapedBody = bodyString.replace(/'/g, "'\\''").replace(/\n/g, '\\n');
    const curlCommand = `curl -X POST '${url}' ${curlHeaders} -d '${escapedBody}'`;
    console.log('[DEBUG] Curl Command:', curlCommand);

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: bodyString,
    });

    // Clone response for debugging so we don't consume the original body
    const clonedResponse = response.clone();

    // Log response details
    const responseHeaders: Record<string, string> = {};
    response.headers.forEach((value, key) => {
      responseHeaders[key] = value;
    });

    try {
      // Read as text first, then try to parse as JSON
      const debugText = await clonedResponse.text();
      let responseBody: unknown;
      let isJson = false;

      try {
        responseBody = JSON.parse(debugText);
        isJson = true;
      } catch {
        responseBody = debugText;
        isJson = false;
      }

      console.log('[DEBUG] POST Response:', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        body: responseBody,
        bodyType: isJson ? 'JSON' : 'text',
        bodyLength: debugText.length,
      });
    } catch (error) {
      // If even text reading fails, log what we can
      console.log('[DEBUG] POST Response (partial):', {
        url,
        status: response.status,
        statusText: response.statusText,
        headers: responseHeaders,
        error: 'Could not read response body',
        errorMessage: error instanceof Error ? error.message : String(error),
      });
    }

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a POST request and returns the response body even if status is not ok
   * Useful for cases where error responses contain important information
   * @param path - The API path or full URL
   */
  async postWithErrorBody<T>(
    path: string,
    data: unknown
  ): Promise<{ body: T; status: number; ok: boolean }> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    const body = (await response.json()) as T;
    return {
      body,
      status: response.status,
      ok: response.ok,
    };
  }

  /**
   * Performs a PUT request
   * @param path - The API path or full URL
   */
  async put<T>(path: string, data: unknown, customHeaders?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'PUT',
      headers: { ...this.getHeaders(), ...customHeaders },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a PATCH request
   * @param path - The API path or full URL
   */
  async patch<T>(path: string, data: unknown, customHeaders?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'PATCH',
      headers: { ...this.getHeaders(), ...customHeaders },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a DELETE request
   * @param path - The API path or full URL
   */
  async delete<T>(path: string, customHeaders?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'DELETE',
      headers: { ...this.getHeaders(), ...customHeaders },
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    // DELETE might return empty body
    const text = await response.text();
    return text ? JSON.parse(text) : ({} as T);
  }
}

/**
 * Configuration options for creating an ArobidClient
 * Values provided here will override process.env
 */
export interface CreateArobidClientOptions {
  baseUrl?: string;
  apiKey?: string;
  tenantId?: string;
}

/**
 * Creates an ArobidClient instance from environment variables or provided options
 * @param options - Optional configuration that overrides process.env values
 */
export function createArobidClient(options?: CreateArobidClientOptions): ArobidClient {
  // Use provided options or fall back to process.env
  const baseUrl = options?.baseUrl || process.env.AROBID_BACKEND_URL;
  if (!baseUrl) {
    throw new Error(
      'AROBID_BACKEND_URL is required. Please provide it via options, headers (X-Arobid-Backend-Url), or set AROBID_BACKEND_URL environment variable.'
    );
  }

  return new ArobidClient({
    baseUrl,
    apiKey: options?.apiKey || process.env.AROBID_API_KEY,
    tenantId: options?.tenantId || process.env.AROBID_TENANT_ID,
  });
}

/**
 * Extracts Arobid configuration from HTTP request headers
 * Supports the following headers:
 * - X-Arobid-Backend-Url (or x-arobid-backend-url)
 * - X-Arobid-Api-Key (or x-arobid-api-key)
 * - X-Arobid-Tenant-Id (or x-arobid-tenant-id)
 */
export function extractConfigFromHeaders(
  headers: Headers | Record<string, string>
): CreateArobidClientOptions {
  const getHeader = (name: string, altName?: string): string | undefined => {
    if (headers instanceof Headers) {
      return headers.get(name) || headers.get(altName || name.toLowerCase()) || undefined;
    }
    // Handle Record<string, string> case
    return headers[name] || headers[altName || name.toLowerCase()] || undefined;
  };

  const config: CreateArobidClientOptions = {};

  const baseUrl = getHeader('X-Arobid-Backend-Url', 'x-arobid-backend-url');
  if (baseUrl) {
    config.baseUrl = baseUrl;
  }

  const apiKey = getHeader('X-Arobid-Api-Key', 'x-arobid-api-key');
  if (apiKey) {
    config.apiKey = apiKey;
  }

  const tenantId = getHeader('X-Arobid-Tenant-Id', 'x-arobid-tenant-id');
  if (tenantId) {
    config.tenantId = tenantId;
  }

  return config;
}
