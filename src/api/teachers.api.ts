import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type {
  Teacher,
  TeacherCreateRequest,
  TeacherUpdateRequest,
  TeacherStatusUpdateRequest,
  TeacherListResponse,
  TeacherQueryParams,
} from '@/types/teacher.types'

export const teachersApi = {
  list: async (params: TeacherQueryParams = {}): Promise<APIResponse<TeacherListResponse>> => {
    const { data } = await apiClient.get('/api/v1/teachers', { params })
    return data
  },

  getByCode: async (teacher_code: string): Promise<APIResponse<Teacher>> => {
    const { data } = await apiClient.get(`/api/v1/teachers/${teacher_code}`)
    return data
  },

  create: async (payload: TeacherCreateRequest): Promise<APIResponse<Teacher>> => {
    const { data } = await apiClient.post('/api/v1/teachers', payload)
    return data
  },

  update: async (teacher_code: string, payload: TeacherUpdateRequest): Promise<APIResponse<Teacher>> => {
    const { data } = await apiClient.patch(`/api/v1/teachers/${teacher_code}`, payload)
    return data
  },

  updateStatus: async (teacher_code: string, payload: TeacherStatusUpdateRequest): Promise<APIResponse<Teacher>> => {
    const { data } = await apiClient.patch(`/api/v1/teachers/${teacher_code}/status`, payload)
    return data
  },

  softDelete: async (teacher_code: string): Promise<APIResponse<null>> => {
    const { data } = await apiClient.delete(`/api/v1/teachers/${teacher_code}`)
    return data
  },
}
