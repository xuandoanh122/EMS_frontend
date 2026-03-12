import type { PaginatedResponse, QueryParams } from './api.types'

export type TeacherStatus = 'active' | 'on_leave' | 'resigned' | 'retired'

export interface Teacher {
  id: number
  teacher_code: string
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  national_id: string | null
  email: string | null
  phone_number: string | null
  address: string | null
  specialization: string | null
  qualification: string | null
  join_date: string | null
  employment_status: TeacherStatus
  department: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TeacherCreateRequest {
  teacher_code: string
  full_name: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  national_id?: string
  email?: string
  phone_number?: string
  address?: string
  specialization?: string
  qualification?: string
  join_date?: string
  employment_status?: TeacherStatus
  department?: string
}

export type TeacherUpdateRequest = Partial<TeacherCreateRequest>

export interface TeacherStatusUpdateRequest {
  new_status: TeacherStatus
  reason?: string
}

export type TeacherListResponse = PaginatedResponse<Teacher>

export interface TeacherQueryParams extends QueryParams {
  employment_status?: TeacherStatus
  department?: string
  specialization?: string
}

export const TEACHER_STATUS_LABEL: Record<TeacherStatus, string> = {
  active: 'Đang công tác',
  on_leave: 'Đang nghỉ phép',
  resigned: 'Đã nghỉ việc',
  retired: 'Đã nghỉ hưu',
}

export const VALID_TEACHER_STATUS_TRANSITIONS: Record<TeacherStatus, TeacherStatus[]> = {
  active: ['on_leave', 'resigned', 'retired'],
  on_leave: ['active', 'resigned'],
  resigned: [],
  retired: [],
}
