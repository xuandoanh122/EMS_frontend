import axios from 'axios'
import type { APIResponse } from '@/types/api.types'
import apiClient from './client'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://10.10.115.69:8000'

const authClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 15000,
})

export interface LoginRequest {
    email: string
    password: string
}

export interface LoginResponse {
    access_token: string
    refresh_token: string
    token_type: string
    expires_in: number
    role: string
    user_id: number
    teacher_id: number | null
    must_change_password: boolean
    email?: string
    username?: string
}

export interface AuthUser {
    id: number
    username: string
    email?: string
    role: string
    teacher_id: number | null
    full_name?: string
    must_change_password?: boolean
}

// Teacher Account Types
export interface CreateTeacherAccountRequest {
    send_email: boolean
}

export interface CreateTeacherAccountResponse {
    user_id: number
    teacher_id: number
    teacher_code: string
    teacher_name: string
    email: string
    username: string
    temp_password: string
    email_sent: boolean
    must_change_password: boolean
}

export interface ChangePasswordRequest {
    old_password?: string
    new_password: string
}

export interface ForgotPasswordRequest {
    email: string
}

export interface ResetPasswordRequest {
    token: string
    new_password: string
}

export interface UserAccountStatus {
    user_id: number
    teacher_id: number
    teacher_code: string
    teacher_name: string
    email: string
    username: string
    is_active: boolean
    must_change_password: boolean
}

export const authApi = {
    /**
     * Đăng nhập lấy JWT token
     */
    login: async (data: LoginRequest): Promise<APIResponse<LoginResponse>> => {
        const response = await authClient.post<APIResponse<LoginResponse>>('/api/v1/auth/login', data)
        return response.data
    },

    /**
     * Làm mới access token từ refresh token
     */
    refreshToken: async (refreshToken: string): Promise<APIResponse<LoginResponse>> => {
        const response = await authClient.post<APIResponse<LoginResponse>>('/api/v1/auth/refresh', {
            refresh_token: refreshToken,
        })
        return response.data
    },

    /**
     * Đăng xuất (blacklist token)
     */
    logout: async (token: string, tokenType: 'access' | 'refresh' = 'access'): Promise<void> => {
        await authClient.post('/api/v1/auth/logout', {
            token,
            token_type: tokenType,
        })
    },

    /**
     * Tạo tài khoản cho giáo viên
     */
    createTeacherAccount: async (teacherId: number, data: CreateTeacherAccountRequest): Promise<APIResponse<CreateTeacherAccountResponse>> => {
        const response = await apiClient.post<APIResponse<CreateTeacherAccountResponse>>(
            `/api/v1/auth/teachers/${teacherId}/account`,
            data
        )
        return response.data
    },

    /**
     * Lấy thông tin tài khoản của giáo viên
     */
    getTeacherAccount: async (teacherId: number): Promise<APIResponse<UserAccountStatus>> => {
        const response = await apiClient.get<APIResponse<UserAccountStatus>>(
            `/api/v1/auth/teachers/${teacherId}/account`
        )
        return response.data
    },

    /**
     * Vô hiệu hóa tài khoản người dùng
     */
    disableUserAccount: async (userId: number): Promise<APIResponse<UserAccountStatus>> => {
        const response = await apiClient.patch<APIResponse<UserAccountStatus>>(
            `/api/v1/auth/users/${userId}/disable`
        )
        return response.data
    },

    /**
     * Kích hoạt lại tài khoản người dùng
     */
    enableUserAccount: async (userId: number): Promise<APIResponse<UserAccountStatus>> => {
        const response = await apiClient.patch<APIResponse<UserAccountStatus>>(
            `/api/v1/auth/users/${userId}/enable`
        )
        return response.data
    },

    /**
     * Xóa tài khoản người dùng
     */
    deleteUserAccount: async (userId: number): Promise<APIResponse<null>> => {
        const response = await apiClient.delete<APIResponse<null>>(
            `/api/v1/auth/users/${userId}`
        )
        return response.data
    },

    /**
     * Đổi mật khẩu
     */
    changePassword: async (data: ChangePasswordRequest): Promise<APIResponse<{ success: boolean; message: string }>> => {
        const response = await apiClient.post<APIResponse<{ success: boolean; message: string }>>(
            '/api/v1/auth/change-password',
            data
        )
        return response.data
    },

    /**
     * Quên mật khẩu - gửi email reset
     */
    forgotPassword: async (data: ForgotPasswordRequest): Promise<APIResponse<{ success: boolean; message: string }>> => {
        const response = await authClient.post<APIResponse<{ success: boolean; message: string }>>(
            '/api/v1/auth/forgot-password',
            data
        )
        // Backend returns: { code: 200, message: "Success", detail: "...", data: null }
        // For security, don't reveal if email exists
        // So we return success: true if code is 200
        if (response.data.code === 200) {
            return {
                ...response.data,
                data: { success: true, message: response.data.detail || 'Email đã được gửi' }
            }
        }
        return response.data
    },

    /**
     * Đặt lại mật khẩu với token
     */
    resetPassword: async (data: ResetPasswordRequest): Promise<APIResponse<{ success: boolean; message: string }>> => {
        const response = await authClient.post<APIResponse<{ success: boolean; message: string }>>(
            '/api/v1/auth/reset-password',
            data
        )
        // Backend returns: { code: 200, message: "Success", detail: "...", data: null }
        // We need to check code and return success in data
        if (response.data.code === 200) {
            return {
                ...response.data,
                data: { success: true, message: response.data.detail || 'Đặt lại mật khẩu thành công' }
            }
        }
        return response.data
    },
}

export default authApi
