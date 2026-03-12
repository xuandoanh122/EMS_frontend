import axios from 'axios'
import { toast } from 'sonner'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000,
})

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status
    const detail = error.response?.data?.detail ?? error.message

    if (status === 401) {
      localStorage.removeItem('access_token')
      window.location.href = '/login'
      toast.error('Phiên đăng nhập đã hết hạn')
    } else if (status === 403) {
      toast.error('Bạn không có quyền thực hiện thao tác này')
    } else if (status === 404) {
      // Handled individually per request
    } else if (status === 409) {
      // Handled individually (duplicate)
    } else if (status >= 500) {
      toast.error(`Lỗi máy chủ: ${detail}`)
    }

    return Promise.reject(error)
  },
)

export default apiClient
