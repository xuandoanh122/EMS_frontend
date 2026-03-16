import { AxiosError } from 'axios'

// API Response type from backend
export interface APIErrorResponse {
    code: number
    message: string
    detail: string
    data: unknown
    errors: unknown
}

// Error categories for better user experience
export type ErrorCategory =
    | 'auth'           // Authentication errors (login, token)
    | 'validation'     // Validation errors (input data)
    | 'conflict'       // Duplicate data errors
    | 'not_found'      // Resource not found
    | 'forbidden'      // Permission denied
    | 'system'         // Server errors
    | 'network'        // Network errors

// User-friendly error message mapping
interface ErrorMessageMap {
    [key: string]: {
        message: string
        category: ErrorCategory
        severity: 'error' | 'warning' | 'info'
        action?: string // What user should do
    }
}

// Comprehensive error message mapping based on API.md
const errorMessages: ErrorMessageMap = {
    // Authentication Errors (401)
    'Invalid Credentials': {
        message: 'Tên đăng nhập hoặc mật khẩu không đúng',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin đăng nhập'
    },
    'Account Disabled': {
        message: 'Tài khoản của bạn đã bị vô hiệu hóa',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng liên hệ quản trị viên để được hỗ trợ'
    },
    'Token Invalid': {
        message: 'Phiên làm việc không hợp lệ',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng đăng nhập lại'
    },
    'Token Expired': {
        message: 'Phiên đăng nhập đã hết hạn',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng đăng nhập lại'
    },
    'Token Blacklisted': {
        message: 'Phiên làm việc đã bị thu hồi',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng đăng nhập lại'
    },
    'Unauthorized': {
        message: 'Bạn cần đăng nhập để tiếp tục',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng đăng nhập'
    },

    // Validation Errors (422)
    'Validation Error': {
        message: 'Thông tin nhập không hợp lệ',
        category: 'validation',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin đã nhập'
    },
    'Token không hợp lệ hoặc đã hết hạn': {
        message: 'Liên kết đặt lại mật khẩu đã hết hạn hoặc không hợp lệ',
        category: 'validation',
        severity: 'error',
        action: 'Vui lòng yêu cầu đặt lại mật khẩu mới'
    },
    'Mật khẩu phải có ít nhất 6 ký tự': {
        message: 'Mật khẩu phải có ít nhất 6 ký tự',
        category: 'validation',
        severity: 'error',
        action: 'Vui lòng nhập mật khẩu có ít nhất 6 ký tự'
    },
    'Mật khẩu cũ không đúng': {
        message: 'Mật khẩu cũ không đúng',
        category: 'validation',
        severity: 'error',
        action: 'Vui lòng nhập đúng mật khẩu cũ'
    },
    'teacher_id is required for teacher role': {
        message: 'Vui lòng chọn giáo viên cho tài khoản',
        category: 'validation',
        severity: 'error',
        action: 'Chọn giáo viên trước khi tạo tài khoản'
    },

    // Conflict Errors (409)
    'Already Exists': {
        message: 'Dữ liệu đã tồn tại trong hệ thống',
        category: 'conflict',
        severity: 'error',
        action: 'Vui lòng sử dụng thông tin khác hoặc kiểm tra lại'
    },
    'User already exists': {
        message: 'Tài khoản đã tồn tại trong hệ thống',
        category: 'conflict',
        severity: 'error',
        action: 'Vui lòng sử dụng email khác hoặc liên hệ quản trị viên'
    },
    'Admin user already exists': {
        message: 'Tài khoản quản trị đã được khởi tạo',
        category: 'conflict',
        severity: 'error',
        action: 'Liên hệ quản trị viên để được hỗ trợ'
    },
    'Invalid bootstrap secret': {
        message: 'Mã bảo mật không chính xác',
        category: 'auth',
        severity: 'error',
        action: 'Vui lòng kiểm tra mã khởi tạo hệ thống'
    },

    // Not Found Errors (404)
    'Not Found': {
        message: 'Không tìm thấy dữ liệu yêu cầu',
        category: 'not_found',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin'
    },
    'User not found': {
        message: 'Không tìm thấy người dùng',
        category: 'not_found',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin'
    },
    'Teacher not found': {
        message: 'Không tìm thấy giáo viên',
        category: 'not_found',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin'
    },
    'Student not found': {
        message: 'Không tìm thấy học sinh',
        category: 'not_found',
        severity: 'error',
        action: 'Vui lòng kiểm tra lại thông tin'
    },

    // Forbidden Errors (403)
    'Forbidden': {
        message: 'Bạn không có quyền thực hiện thao tác này',
        category: 'forbidden',
        severity: 'error',
        action: 'Liên hệ quản trị viên để được cấp quyền'
    },
    'Insufficient permissions': {
        message: 'Bạn không có quyền thực hiện thao tác này',
        category: 'forbidden',
        severity: 'error',
        action: 'Liên hệ quản trị viên để được cấp quyền'
    },

    // System Errors (500)
    'Internal Server Error': {
        message: 'Đã xảy ra lỗi hệ thống',
        category: 'system',
        severity: 'error',
        action: 'Vui lòng thử lại sau hoặc liên hệ quản trị viên'
    },

    // Network Errors
    'Network Error': {
        message: 'Không thể kết nối đến máy chủ',
        category: 'network',
        severity: 'error',
        action: 'Vui lòng kiểm tra kết nối mạng và thử lại'
    },
    'timeout': {
        message: 'Yêu cầu mất quá lâu, vui lòng thử lại',
        category: 'network',
        severity: 'warning',
        action: 'Thử lại hoặc kiểm tra kết nối mạng'
    }
}

/**
 * Parse error from axios response
 */
export function parseAPIError(error: unknown): {
    message: string
    category: ErrorCategory
    severity: 'error' | 'warning' | 'info'
    action?: string
    originalMessage?: string
    statusCode?: number
} {
    // Default error response
    const defaultError = {
        message: 'Đã xảy ra lỗi không mong muốn',
        category: 'system' as ErrorCategory,
        severity: 'error' as const,
        action: 'Vui lòng thử lại sau',
        originalMessage: 'Unknown error'
    }

    // Handle AxiosError
    if (error instanceof AxiosError) {
        const status = error.response?.status
        const responseData = error.response?.data as APIErrorResponse

        // Handle network errors
        if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
            return {
                ...errorMessages['timeout'],
                originalMessage: error.message,
                statusCode: undefined
            }
        }

        if (!error.response) {
            return {
                ...errorMessages['Network Error'],
                originalMessage: error.message,
                statusCode: undefined
            }
        }

        // Get message from response
        const apiMessage = responseData?.message || responseData?.detail || error.message
        const detailMessage = responseData?.detail || ''

        // Try to match with known error messages
        for (const [key, errorInfo] of Object.entries(errorMessages)) {
            if (apiMessage.includes(key) || detailMessage.includes(key)) {
                return {
                    ...errorInfo,
                    originalMessage: apiMessage,
                    statusCode: status
                }
            }
        }

        // Handle by HTTP status code
        switch (status) {
            case 401:
                return {
                    ...errorMessages['Unauthorized'],
                    originalMessage: apiMessage,
                    statusCode: 401
                }
            case 403:
                return {
                    ...errorMessages['Forbidden'],
                    originalMessage: apiMessage,
                    statusCode: 403
                }
            case 404:
                return {
                    ...errorMessages['Not Found'],
                    originalMessage: apiMessage,
                    statusCode: 404
                }
            case 409:
                return {
                    ...errorMessages['Already Exists'],
                    originalMessage: apiMessage,
                    statusCode: 409
                }
            case 422:
                return {
                    message: detailMessage || 'Thông tin nhập không hợp lệ',
                    category: 'validation',
                    severity: 'error',
                    action: 'Vui lòng kiểm tra lại thông tin đã nhập',
                    originalMessage: apiMessage,
                    statusCode: 422
                }
            case 500:
            case 502:
            case 503:
                return {
                    ...errorMessages['Internal Server Error'],
                    originalMessage: apiMessage,
                    statusCode: status
                }
        }

        return {
            message: apiMessage || 'Đã xảy ra lỗi',
            category: 'system',
            severity: 'error',
            action: 'Vui lòng thử lại sau',
            originalMessage: apiMessage,
            statusCode: status
        }
    }

    // Handle regular Error
    if (error instanceof Error) {
        return {
            message: error.message || 'Đã xảy ra lỗi',
            category: 'system',
            severity: 'error',
            action: 'Vui lòng thử lại sau',
            originalMessage: error.message,
            statusCode: undefined
        }
    }

    return defaultError
}

/**
 * Check if error is authentication related
 */
export function isAuthError(error: unknown): boolean {
    const parsed = parseAPIError(error)
    return parsed.category === 'auth'
}

/**
 * Check if error is validation related
 */
export function isValidationError(error: unknown): boolean {
    const parsed = parseAPIError(error)
    return parsed.category === 'validation'
}

/**
 * Check if error is network related
 */
export function isNetworkError(error: unknown): boolean {
    const parsed = parseAPIError(error)
    return parsed.category === 'network'
}

/**
 * Get error category for logging/tracking
 */
export function getErrorCategory(error: unknown): ErrorCategory {
    return parseAPIError(error).category
}
