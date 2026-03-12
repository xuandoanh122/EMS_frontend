import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type {
  Classroom,
  ClassroomCreateRequest,
  ClassroomUpdateRequest,
  ClassroomStatusUpdateRequest,
  ClassroomListResponse,
  ClassroomQueryParams,
  Enrollment,
  EnrollmentCreateRequest,
  EnrollmentListResponse,
  EnrollmentStatusUpdateRequest,
} from '@/types/classroom.types'

export const classroomsApi = {
  list: async (params: ClassroomQueryParams = {}): Promise<APIResponse<ClassroomListResponse>> => {
    const { data } = await apiClient.get('/api/v1/classrooms', { params })
    return data
  },

  getByCode: async (class_code: string): Promise<APIResponse<Classroom>> => {
    const { data } = await apiClient.get(`/api/v1/classrooms/${class_code}`)
    return data
  },

  create: async (payload: ClassroomCreateRequest): Promise<APIResponse<Classroom>> => {
    const { data } = await apiClient.post('/api/v1/classrooms', payload)
    return data
  },

  update: async (class_code: string, payload: ClassroomUpdateRequest): Promise<APIResponse<Classroom>> => {
    const { data } = await apiClient.patch(`/api/v1/classrooms/${class_code}`, payload)
    return data
  },

  updateStatus: async (class_code: string, payload: ClassroomStatusUpdateRequest): Promise<APIResponse<Classroom>> => {
    const { data } = await apiClient.patch(`/api/v1/classrooms/${class_code}/status`, payload)
    return data
  },

  softDelete: async (class_code: string): Promise<APIResponse<null>> => {
    const { data } = await apiClient.delete(`/api/v1/classrooms/${class_code}`)
    return data
  },

  // ── Enrollment endpoints ──────────────────────────────────────────────────
  getEnrollments: async (
    class_code: string,
    params: { page?: number; page_size?: number } = {},
  ): Promise<APIResponse<EnrollmentListResponse>> => {
    const { data } = await apiClient.get(`/api/v1/classrooms/${class_code}/enrollments`, { params })
    return data
  },

  addEnrollment: async (
    class_code: string,
    payload: EnrollmentCreateRequest,
  ): Promise<APIResponse<Enrollment>> => {
    const { data } = await apiClient.post(`/api/v1/classrooms/${class_code}/enrollments`, payload)
    return data
  },

  getEnrollmentById: async (enrollment_id: number): Promise<APIResponse<Enrollment>> => {
    const { data } = await apiClient.get(`/api/v1/classrooms/enrollments/${enrollment_id}`)
    return data
  },

  updateEnrollmentNotes: async (
    enrollment_id: number,
    payload: { notes?: string },
  ): Promise<APIResponse<Enrollment>> => {
    const { data } = await apiClient.patch(`/api/v1/classrooms/enrollments/${enrollment_id}`, payload)
    return data
  },

  updateEnrollmentStatus: async (
    enrollment_id: number,
    payload: EnrollmentStatusUpdateRequest,
  ): Promise<APIResponse<Enrollment>> => {
    const { data } = await apiClient.patch(
      `/api/v1/classrooms/enrollments/${enrollment_id}/status`,
      payload,
    )
    return data
  },

  getStudentEnrollments: async (student_id: number): Promise<APIResponse<EnrollmentListResponse>> => {
    const { data } = await apiClient.get(`/api/v1/classrooms/students/${student_id}/enrollments`)
    return data
  },
}
