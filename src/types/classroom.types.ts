import type { PaginatedResponse, QueryParams } from './api.types'
import type { Student } from './student.types'

export type ClassroomStatus = 'active' | 'inactive' | 'full'

export interface Classroom {
  id: number
  class_code: string
  class_name: string
  academic_year: string | null
  grade_level: string | null
  max_students: number
  current_enrollment: number
  homeroom_teacher_code: string | null
  homeroom_teacher_name: string | null
  description: string | null
  status: ClassroomStatus
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClassroomCreateRequest {
  class_code: string
  class_name: string
  academic_year?: string
  grade_level?: string
  max_students?: number
  homeroom_teacher_code?: string
  description?: string
  status?: ClassroomStatus
}

export type ClassroomUpdateRequest = Partial<ClassroomCreateRequest>

export interface ClassroomStatusUpdateRequest {
  new_status: ClassroomStatus
  reason?: string
}

export type ClassroomListResponse = PaginatedResponse<Classroom>

export interface ClassroomQueryParams extends QueryParams {
  status?: ClassroomStatus
  academic_year?: string
  grade_level?: string
  homeroom_teacher_code?: string
}

export interface EnrollmentCreateRequest {
  student_code: string
  enrollment_date?: string
  notes?: string
}

export interface Enrollment {
  id: number
  student_code: string
  student_name: string
  enrollment_date: string | null
  status: 'active' | 'transferred' | 'dropped'
  notes: string | null
}

export type EnrollmentListResponse = PaginatedResponse<Student>

export const CLASSROOM_STATUS_LABEL: Record<ClassroomStatus, string> = {
  active: 'Đang hoạt động',
  inactive: 'Không hoạt động',
  full: 'Đã đầy',
}

export const VALID_CLASSROOM_STATUS_TRANSITIONS: Record<ClassroomStatus, ClassroomStatus[]> = {
  active: ['inactive', 'full'],
  inactive: ['active'],
  full: ['active', 'inactive'],
}
