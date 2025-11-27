/**
 * Event status codes and their descriptions for Arobid events
 * These codes represent different states of events in the Arobid platform
 */

export interface EventStatusInfo {
  code: number;
  name: string;
  description: string;
  descriptionVi: string;
}

/**
 * Mapping of event status codes to their descriptions
 * Status codes represent different states of events in Arobid
 * Based on EventStatus enum from Arobid Backend:
 * - InProgress = "0"
 * - ComingSoon = "1"
 * - Progressed = "2"
 */
export const EVENT_STATUS_CODES: Record<number, EventStatusInfo> = {
  0: {
    code: 0,
    name: 'InProgress',
    description: 'Event is currently in progress',
    descriptionVi: 'Sự kiện đang diễn ra',
  },
  1: {
    code: 1,
    name: 'ComingSoon',
    description: 'Event is coming soon, not yet started',
    descriptionVi: 'Sự kiện sắp diễn ra, chưa bắt đầu',
  },
  2: {
    code: 2,
    name: 'Progressed',
    description: 'Event has progressed/completed',
    descriptionVi: 'Sự kiện đã hoàn thành/đã tiến triển',
  },
};

/**
 * Gets the description for a status code
 * @param code - The status code
 * @param language - Language preference ('en' or 'vi', default: 'en')
 * @returns Description string or undefined if code not found
 */
export function getStatusDescription(code: number, language: 'en' | 'vi' = 'en'): string | undefined {
  const statusInfo = EVENT_STATUS_CODES[code];
  if (!statusInfo) {
    return undefined;
  }
  return language === 'vi' ? statusInfo.descriptionVi : statusInfo.description;
}

/**
 * Gets the status name for a status code
 * @param code - The status code
 * @returns Status name or undefined if code not found
 */
export function getStatusName(code: number): string | undefined {
  return EVENT_STATUS_CODES[code]?.name;
}

/**
 * Gets all available status codes
 * @returns Array of status codes
 */
export function getAllStatusCodes(): number[] {
  return Object.keys(EVENT_STATUS_CODES).map(Number);
}

/**
 * Generates a formatted description string for MCP tool documentation
 * @param language - Language preference ('en' or 'vi', default: 'en')
 * @returns Formatted string describing all status codes
 */
export function getStatusCodesDescription(language: 'en' | 'vi' = 'en'): string {
  const codes = getAllStatusCodes().sort((a, b) => a - b);
  const lines = codes.map((code) => {
    const info = EVENT_STATUS_CODES[code];
    const desc = language === 'vi' ? info.descriptionVi : info.description;
    return `  - ${code}: ${info.name} - ${desc}`;
  });

  const header =
    language === 'vi'
      ? 'Các mã trạng thái sự kiện:'
      : 'Event status codes:';
  
  return `${header}\n${lines.join('\n')}`;
}

/**
 * Generates a concise description for use in MCP tool parameter descriptions
 * @param language - Language preference ('en' or 'vi', default: 'en')
 * @returns Concise description string
 */
export function getStatusFilterDescription(language: 'en' | 'vi' = 'en'): string {
  const codes = getAllStatusCodes().sort((a, b) => a - b);
  const codeList = codes.join(', ');
  
  if (language === 'vi') {
    return `Lọc theo trạng thái sự kiện. Các mã trạng thái: ${codeList}. Ví dụ: [0, 1] để lọc các sự kiện đang diễn ra hoặc sắp diễn ra.`;
  }
  
  return `Filter events by status. Available status codes: ${codeList}. Example: [0, 1] to filter in-progress or coming-soon events.`;
}

