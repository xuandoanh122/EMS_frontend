import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi, AuthUser, LoginResponse } from '@/api/auth.api'
import { toast } from 'sonner'
import { parseAPIError } from '@/lib/errors'

export interface AuthState {
  user: AuthUser | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  mustChangePassword: boolean
  setAuth: (user: AuthUser, accessToken: string, refreshToken?: string, mustChangePassword?: boolean) => void
  clearAuth: () => void
  login: (email: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  setMustChangePassword: (value: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      mustChangePassword: false,

      setAuth: (user, accessToken, refreshToken, mustChangePassword = false) => {
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
          localStorage.setItem('refresh_token', refreshToken)
        }
        set({ user, accessToken, refreshToken: refreshToken ?? get().refreshToken, isAuthenticated: true, mustChangePassword })
      },

      clearAuth: () => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, mustChangePassword: false })
      },

      setMustChangePassword: (value: boolean) => {
        set({ mustChangePassword: value })
        if (get().user) {
          get().user!.must_change_password = value
        }
      },

      login: async (email: string, password: string): Promise<boolean> => {
        try {
          const apiResponse = await authApi.login({ email, password })

          // API returns envelope: { code, message, detail, data, errors }
          // We need to access .data to get the actual LoginResponse
          if (!apiResponse.data) {
            throw new Error(apiResponse.detail || 'Login failed - no data returned')
          }

          const { access_token, refresh_token, role, user_id, teacher_id, must_change_password, email: userEmail, username } = apiResponse.data

          const user: AuthUser = {
            id: user_id,
            email: userEmail,
            username: username || userEmail?.split('@')[0] || '',
            role,
            teacher_id,
            must_change_password,
          }

          get().setAuth(user, access_token, refresh_token, must_change_password)
          toast.success('Đăng nhập thành công!')
          return true
        } catch (error: any) {
          // Error toast is already shown by API interceptor
          // Just return false to let the UI know login failed
          // But we can add additional context if needed
          const parsedError = parseAPIError(error)

          // If the error wasn't handled by interceptor (shouldn't happen), show a fallback
          if (!parsedError.message) {
            toast.error('Đăng nhập thất bại. Vui lòng thử lại.')
          }

          return false
        }
      },

      logout: async () => {
        const { accessToken, refreshToken, clearAuth } = get()

        // Try to blacklist the token, but don't wait for it
        if (accessToken) {
          try {
            await authApi.logout(accessToken, 'access')
          } catch (error) {
            // Ignore errors during logout
          }
        }

        if (refreshToken) {
          try {
            await authApi.logout(refreshToken, 'refresh')
          } catch (error) {
            // Ignore errors during logout
          }
        }

        clearAuth()
        window.location.href = '/login'
      },
    }),
    {
      name: 'ems-auth',
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
        mustChangePassword: state.mustChangePassword,
      }),
    },
  ),
)
