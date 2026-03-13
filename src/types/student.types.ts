import type { PaginatedResponse, QueryParams } from './api.types'

export type StudentStatus = 'active' | 'preserved' | 'suspended' | 'graduated'

export interface Student {
  id: number
  student_code: string
  full_name: string
  date_of_birth: string | null
  gender: 'male' | 'female' | 'other' | null
  national_id: string | null
  email: string | null
  phone_number: string | null
  address: string | null
  enrollment_date: string | null
  academic_status: StudentStatus
  class_name: string | null
  program_name: string | null
  parent_full_name: string | null
  parent_phone: string | null
  parent_email: string | null
  medical_notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudentCreateRequest {
  full_name: string
  date_of_birth?: string
  gender?: 'male' | 'female' | 'other'
  national_id?: string
  email?: string
  phone_number?: string
  address?: string
  enrollment_date?: string
  academic_status?: StudentStatus
  class_ids?: number[]
  parent_full_name?: string
  parent_phone?: string
  parent_email?: string
  medical_notes?: string
}

export type StudentUpdateRequest = Omit<StudentCreateRequest, 'class_ids' | 'academic_status'>

export interface StudentStatusUpdateRequest {
  new_status: StudentStatus
  reason?: string
}

export type StudentListResponse = PaginatedResponse<Student>

export interface StudentQueryParams extends QueryParams {
  academic_status?: StudentStatus
  has_enrollment?: boolean
  classroom_id?: number
}

export const STUDENT_STATUS_LABEL: Record<StudentStatus, string> = {
  active: 'Đang học',
  preserved: 'Bảo lưu',
  suspended: 'Đình chỉ',
  graduated: 'Tốt nghiệp',
}

export const VALID_STUDENT_STATUS_TRANSITIONS: Record<StudentStatus, StudentStatus[]> = {
  active: ['preserved', 'suspended', 'graduated'],
  preserved: ['active', 'suspended'],
  suspended: ['active'],
  graduated: [],
}
