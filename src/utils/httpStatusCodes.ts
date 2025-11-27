/**
 * HTTP status codes and their descriptions for Arobid API error handling
 * These codes represent HTTP response status codes from the Arobid Backend API
 */

export interface HttpStatusInfo {
  code: number;
  name: string;
  description: string;
  descriptionVi: string;
}

/**
 * Mapping of HTTP status codes to their descriptions
 * Common HTTP status codes used by Arobid Backend API
 */
export const HTTP_STATUS_CODES: Record<number, HttpStatusInfo> = {
  200: {
    code: 200,
    name: 'OK',
    description: 'Request succeeded',
    descriptionVi: 'Yêu cầu thành công',
  },
  201: {
    code: 201,
    name: 'Created',
    description: 'Resource created successfully',
    descriptionVi: 'Tài nguyên đã được tạo thành công',
  },
  400: {
    code: 400,
    name: 'Bad Request',
    description: 'Invalid request parameters or malformed request',
    descriptionVi: 'Tham số yêu cầu không hợp lệ hoặc yêu cầu bị lỗi định dạng',
  },
  401: {
    code: 401,
    name: 'Unauthorized',
    description: 'Authentication required or invalid credentials',
    descriptionVi: 'Yêu cầu xác thực hoặc thông tin đăng nhập không hợp lệ',
  },
  403: {
    code: 403,
    name: 'Forbidden',
    description: 'Access denied, insufficient permissions',
    descriptionVi: 'Truy cập bị từ chối, không đủ quyền',
  },
  404: {
    code: 404,
    name: 'Not Found',
    description: 'Resource not found',
    descriptionVi: 'Không tìm thấy tài nguyên',
  },
  409: {
    code: 409,
    name: 'Conflict',
    description: 'Resource conflict, e.g., duplicate entry',
    descriptionVi: 'Xung đột tài nguyên, ví dụ: bản ghi trùng lặp',
  },
  422: {
    code: 422,
    name: 'Unprocessable Entity',
    description: 'Request is well-formed but contains semantic errors',
    descriptionVi: 'Yêu cầu đúng định dạng nhưng chứa lỗi ngữ nghĩa',
  },
  429: {
    code: 429,
    name: 'Too Many Requests',
    description: 'Rate limit exceeded, too many requests',
    descriptionVi: 'Vượt quá giới hạn tốc độ, quá nhiều yêu cầu',
  },
  500: {
    code: 500,
    name: 'Internal Server Error',
    description: 'Server error, something went wrong on the server',
    descriptionVi: 'Lỗi máy chủ, có vấn đề xảy ra trên máy chủ',
  },
  502: {
    code: 502,
    name: 'Bad Gateway',
    description: 'Invalid response from upstream server',
    descriptionVi: 'Phản hồi không hợp lệ từ máy chủ upstream',
  },
  503: {
    code: 503,
    name: 'Service Unavailable',
    description: 'Service temporarily unavailable',
    descriptionVi: 'Dịch vụ tạm thời không khả dụng',
  },
  504: {
    code: 504,
    name: 'Gateway Timeout',
    description: 'Gateway timeout, server did not respond in time',
    descriptionVi: 'Hết thời gian chờ gateway, máy chủ không phản hồi kịp thời',
  },
};

/**
 * Gets the description for an HTTP status code
 * @param code - The HTTP status code
 * @param language - Language preference ('en' or 'vi', default: 'en')
 * @returns Description string or undefined if code not found
 */
export function getHttpStatusDescription(
  code: number,
  language: 'en' | 'vi' = 'en'
): string | undefined {
  const statusInfo = HTTP_STATUS_CODES[code];
  if (!statusInfo) {
    return undefined;
  }
  return language === 'vi' ? statusInfo.descriptionVi : statusInfo.description;
}

/**
 * Gets the status name for an HTTP status code
 * @param code - The HTTP status code
 * @returns Status name or undefined if code not found
 */
export function getHttpStatusName(code: number): string | undefined {
  return HTTP_STATUS_CODES[code]?.name;
}

/**
 * Formats an HTTP status code with its description for error messages
 * @param code - The HTTP status code
 * @param language - Language preference ('en' or 'vi', default: 'en')
 * @returns Formatted string like "400 (Bad Request: Invalid request parameters)"
 */
export function formatHttpStatus(
  code: number,
  language: 'en' | 'vi' = 'en'
): string {
  const statusInfo = HTTP_STATUS_CODES[code];
  if (statusInfo) {
    const desc = language === 'vi' ? statusInfo.descriptionVi : statusInfo.description;
    return `${code} (${statusInfo.name}: ${desc})`;
  }
  return `${code}`;
}

