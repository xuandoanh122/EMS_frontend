import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { toast } from 'sonner'

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
    const status = error.response?.status

    // Handle 401 - redirect to login
    if (status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('refresh_token')
      window.location.href = '/login'
      toast.error('Phiên đăng nhập đã hết hạn')
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này')
    } else if (status === 500) {
      const detail = (error.response?.data as any)?.detail ?? 'Lỗi máy chủ'
      toast.error(`Lỗi máy chủ: ${detail}`)
    } else if (status === 502 || status === 503) {
      toast.error('Máy chủ đang bảo trì, vui lòng thử lại sau')
    }

    return Promise.reject(error)
  },
)

export default apiClient
