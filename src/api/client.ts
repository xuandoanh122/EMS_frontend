import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'
import { parseAPIError, isAuthError } from '@/lib/errors'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://10.10.115.69:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

// Request interceptor - add auth token
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response interceptor - handle errors
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const parsedError = parseAPIError(error)

    // Handle auth errors specially
    if (isAuthError(error)) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')

      // Only redirect to login if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    }

    // Show toast with user-friendly message
    toast.error(parsedError.message, {
      description: parsedError.action,
      duration: 4000,
    })

    return Promise.reject(error)
  },
)

export default apiClient
