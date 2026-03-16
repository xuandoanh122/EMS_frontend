import { useCallback, useState } from 'react'
import { AxiosError } from 'axios'
import { parseAPIError, isAuthError, isValidationError, type ErrorCategory } from '@/lib/errors'

interface UseApiErrorReturn {
    error: ReturnType<typeof parseAPIError> | null
    setError: (error: unknown) => void
    clearError: () => void
    isAuthError: boolean
    isValidationError: boolean
    errorMessage: string
    errorAction: string | undefined
    errorCategory: ErrorCategory | undefined
}

/**
 * Hook for handling API errors in components
 * Provides easy access to parsed error information
 */
export function useApiError(): UseApiErrorReturn {
    const [error, setErrorState] = useState<ReturnType<typeof parseAPIError> | null>(null)

    const setError = useCallback((error: unknown) => {
        const parsed = parseAPIError(error)
        setErrorState(parsed)
    }, [])

    const clearError = useCallback(() => {
        setErrorState(null)
    }, [])

    return {
        error,
        setError,
        clearError,
        isAuthError: error ? isAuthError(error) : false,
        isValidationError: error ? isValidationError(error) : false,
        errorMessage: error?.message || '',
        errorAction: error?.action,
        errorCategory: error?.category,
    }
}

/**
 * Extract error message from axios error for display
 */
export function getErrorMessage(error: unknown): string {
    const parsed = parseAPIError(error)
    return parsed.message
}

/**
 * Extract action message from axios error
 */
export function getErrorAction(error: unknown): string | undefined {
    const parsed = parseAPIError(error)
    return parsed.action
}

/**
 * Check if should redirect to login
 */
export function shouldRedirectToLogin(error: unknown): boolean {
    return isAuthError(error)
}

/**
 * Type guard for axios error
 */
export function isAxiosError(error: unknown): error is AxiosError {
    return error instanceof AxiosError
}
