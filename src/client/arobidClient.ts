/**
 * HTTP client for interacting with Arobid Backend API
 */

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
   * Converts HTTP errors to ArobidError format
   */
  private async handleError(response: Response): Promise<ArobidError> {
    let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
    let errorCode: string | undefined;

    try {
      const errorBody = (await response.json()) as Record<string, unknown>;
      if (errorBody && typeof errorBody === 'object') {
        errorMessage =
          (typeof errorBody.message === 'string' ? errorBody.message : null) ||
          (typeof errorBody.error === 'string' ? errorBody.error : null) ||
          errorMessage;
        errorCode =
          (typeof errorBody.code === 'string' ? errorBody.code : null) ||
          (typeof errorBody.errorCode === 'string' ? errorBody.errorCode : null) ||
          undefined;
      }
    } catch {
      // If response is not JSON, use status text
      const text = await response.text().catch(() => '');
      if (text) {
        errorMessage = text;
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
   */
  async get<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a POST request
   */
  async post<T>(path: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a PUT request
   */
  async put<T>(path: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a PATCH request
   */
  async patch<T>(path: string, data: unknown): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'PATCH',
      headers: this.getHeaders(),
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw await this.handleError(response);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Performs a DELETE request
   */
  async delete<T>(path: string): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const response = await fetch(url, {
      method: 'DELETE',
      headers: this.getHeaders(),
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
 * Creates an ArobidClient instance from environment variables
 */
export function createArobidClient(): ArobidClient {
  const baseUrl = process.env.AROBID_BACKEND_URL;
  if (!baseUrl) {
    throw new Error(
      'AROBID_BACKEND_URL environment variable is required. Please set it in your .env file or environment.'
    );
  }

  return new ArobidClient({
    baseUrl,
    apiKey: process.env.AROBID_API_KEY,
    tenantId: process.env.AROBID_TENANT_ID,
  });
}

