import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type {
  Student,
  StudentCreateRequest,
  StudentUpdateRequest,
  StudentStatusUpdateRequest,
  StudentListResponse,
  StudentQueryParams,
} from '@/types/student.types'

export const studentsApi = {
  list: async (params: StudentQueryParams = {}): Promise<APIResponse<StudentListResponse>> => {
    const { data } = await apiClient.get('/api/v1/students', { params })
    return data
  },

  getByCode: async (student_code: string): Promise<APIResponse<Student>> => {
    const { data } = await apiClient.get(`/api/v1/students/${student_code}`)
    return data
  },

  create: async (payload: StudentCreateRequest): Promise<APIResponse<Student>> => {
    const { data } = await apiClient.post('/api/v1/students', payload)
    return data
  },

  update: async (student_code: string, payload: StudentUpdateRequest): Promise<APIResponse<Student>> => {
    const { data } = await apiClient.patch(`/api/v1/students/${student_code}`, payload)
    return data
  },

  updateStatus: async (student_code: string, payload: StudentStatusUpdateRequest): Promise<APIResponse<Student>> => {
    const { data } = await apiClient.patch(`/api/v1/students/${student_code}/status`, payload)
    return data
  },

  softDelete: async (student_code: string): Promise<APIResponse<null>> => {
    const { data } = await apiClient.delete(`/api/v1/students/${student_code}`)
    return data
  },
}
