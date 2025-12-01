/**
 * Standardized Error Codes and Messages
 * User-friendly error handling system
 */

export type ErrorCode =
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'SERVICE_UNAVAILABLE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'FORBIDDEN'
  | 'NOT_FOUND'
  | 'VALIDATION_ERROR'
  | 'CONFLICT'
  | 'INTERNAL_ERROR'
  | 'MAINTENANCE'
  | 'INSUFFICIENT_CREDITS'
  | 'PAYMENT_FAILED'
  | 'QUOTA_EXCEEDED'
  | 'INVALID_REQUEST'
  | 'SESSION_EXPIRED'
  | 'UNKNOWN'

interface ErrorInfo {
  title: string
  message: string
  suggestion: string
  retryable: boolean
  httpStatus?: number
}

export const ErrorCodes: Record<ErrorCode, ErrorInfo> = {
  NETWORK_ERROR: {
    title: '네트워크 오류',
    message: '서버에 연결할 수 없습니다.',
    suggestion: '인터넷 연결을 확인하고 다시 시도해주세요.',
    retryable: true,
  },
  TIMEOUT: {
    title: '요청 시간 초과',
    message: '서버 응답이 너무 오래 걸립니다.',
    suggestion: '잠시 후 다시 시도해주세요.',
    retryable: true,
  },
  SERVICE_UNAVAILABLE: {
    title: '서비스 일시 중단',
    message: '서비스가 일시적으로 이용 불가합니다.',
    suggestion: '잠시 후 자동으로 복구됩니다. 계속되면 고객센터에 문의해주세요.',
    retryable: true,
    httpStatus: 503,
  },
  RATE_LIMITED: {
    title: '요청 제한',
    message: '너무 많은 요청을 보냈습니다.',
    suggestion: '잠시 후 다시 시도해주세요.',
    retryable: true,
    httpStatus: 429,
  },
  UNAUTHORIZED: {
    title: '인증 필요',
    message: '로그인이 필요합니다.',
    suggestion: '로그인 후 다시 시도해주세요.',
    retryable: false,
    httpStatus: 401,
  },
  FORBIDDEN: {
    title: '접근 권한 없음',
    message: '이 작업을 수행할 권한이 없습니다.',
    suggestion: '관리자에게 문의해주세요.',
    retryable: false,
    httpStatus: 403,
  },
  NOT_FOUND: {
    title: '찾을 수 없음',
    message: '요청한 리소스를 찾을 수 없습니다.',
    suggestion: 'URL을 확인하거나 이전 페이지로 돌아가주세요.',
    retryable: false,
    httpStatus: 404,
  },
  VALIDATION_ERROR: {
    title: '입력 오류',
    message: '입력한 정보가 올바르지 않습니다.',
    suggestion: '입력 내용을 확인하고 다시 시도해주세요.',
    retryable: false,
    httpStatus: 400,
  },
  CONFLICT: {
    title: '충돌 발생',
    message: '요청이 현재 상태와 충돌합니다.',
    suggestion: '페이지를 새로고침하고 다시 시도해주세요.',
    retryable: true,
    httpStatus: 409,
  },
  INTERNAL_ERROR: {
    title: '서버 오류',
    message: '서버에서 오류가 발생했습니다.',
    suggestion: '잠시 후 다시 시도해주세요. 계속되면 고객센터에 문의해주세요.',
    retryable: true,
    httpStatus: 500,
  },
  MAINTENANCE: {
    title: '시스템 점검 중',
    message: '서비스 점검 중입니다.',
    suggestion: '점검이 완료되면 자동으로 복구됩니다.',
    retryable: false,
  },
  INSUFFICIENT_CREDITS: {
    title: '크레딧 부족',
    message: '메시지 발송을 위한 크레딧이 부족합니다.',
    suggestion: '크레딧을 충전하고 다시 시도해주세요.',
    retryable: false,
    httpStatus: 402,
  },
  PAYMENT_FAILED: {
    title: '결제 실패',
    message: '결제를 처리할 수 없습니다.',
    suggestion: '결제 정보를 확인하고 다시 시도해주세요.',
    retryable: true,
    httpStatus: 402,
  },
  QUOTA_EXCEEDED: {
    title: '할당량 초과',
    message: '일일 발송 한도를 초과했습니다.',
    suggestion: '내일 다시 시도하거나 요금제를 업그레이드해주세요.',
    retryable: false,
  },
  INVALID_REQUEST: {
    title: '잘못된 요청',
    message: '요청 형식이 올바르지 않습니다.',
    suggestion: '입력 내용을 확인하고 다시 시도해주세요.',
    retryable: false,
    httpStatus: 400,
  },
  SESSION_EXPIRED: {
    title: '세션 만료',
    message: '로그인 세션이 만료되었습니다.',
    suggestion: '다시 로그인해주세요.',
    retryable: false,
    httpStatus: 401,
  },
  UNKNOWN: {
    title: '알 수 없는 오류',
    message: '예기치 않은 오류가 발생했습니다.',
    suggestion: '문제가 계속되면 고객센터에 문의해주세요.',
    retryable: true,
  },
}

/**
 * Get user-friendly error message
 */
export function getErrorMessage(code: ErrorCode | string): ErrorInfo {
  if (code in ErrorCodes) {
    return ErrorCodes[code as ErrorCode]
  }
  return ErrorCodes.UNKNOWN
}

/**
 * Map HTTP status to error code
 */
export function httpStatusToErrorCode(status: number): ErrorCode {
  switch (status) {
    case 400:
      return 'VALIDATION_ERROR'
    case 401:
      return 'UNAUTHORIZED'
    case 402:
      return 'PAYMENT_FAILED'
    case 403:
      return 'FORBIDDEN'
    case 404:
      return 'NOT_FOUND'
    case 409:
      return 'CONFLICT'
    case 429:
      return 'RATE_LIMITED'
    case 500:
    case 502:
      return 'INTERNAL_ERROR'
    case 503:
      return 'SERVICE_UNAVAILABLE'
    default:
      if (status >= 500) return 'INTERNAL_ERROR'
      if (status >= 400) return 'INVALID_REQUEST'
      return 'UNKNOWN'
  }
}

/**
 * Create a user-friendly error from any error
 */
export class UserFriendlyError extends Error {
  public readonly code: ErrorCode
  public readonly info: ErrorInfo
  public readonly originalError?: Error

  constructor(code: ErrorCode, originalError?: Error) {
    const info = getErrorMessage(code)
    super(info.message)
    this.name = 'UserFriendlyError'
    this.code = code
    this.info = info
    this.originalError = originalError
  }

  get title(): string {
    return this.info.title
  }

  get suggestion(): string {
    return this.info.suggestion
  }

  get isRetryable(): boolean {
    return this.info.retryable
  }

  toJSON() {
    return {
      code: this.code,
      title: this.title,
      message: this.message,
      suggestion: this.suggestion,
      retryable: this.isRetryable,
    }
  }
}
