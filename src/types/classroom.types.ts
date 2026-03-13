import type { PaginatedResponse, QueryParams } from './api.types'

export type ClassType = 'standard' | 'specialized' | 'advanced'
export type EnrollmentType = 'primary' | 'secondary'
export type EnrollmentStatus = 'active' | 'transferred' | 'withdrawn' | 'completed'

export interface Classroom {
  id: number
  class_code: string
  class_name: string
  class_type: ClassType
  academic_year: string | null
  grade_level: number | null
  max_capacity: number
  current_enrollment: number
  homeroom_teacher_id: number | null
  homeroom_teacher_code: string | null
  homeroom_teacher_name: string | null
  room_number: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ClassroomCreateRequest {
  class_code: string
  class_name: string
  class_type?: ClassType
  academic_year: string
  grade_level: number
  max_capacity?: number
  homeroom_teacher_id?: number
  room_number?: string
  description?: string
}

export type ClassroomUpdateRequest = Partial<Omit<ClassroomCreateRequest, 'class_code'>>

export interface ClassroomStatusUpdateRequest {
  new_status: string
  reason?: string
}

export type ClassroomListResponse = PaginatedResponse<Classroom>

export interface ClassroomQueryParams extends QueryParams {
  class_type?: ClassType
  academic_year?: string
  grade_level?: number
  homeroom_teacher_id?: number
}

export interface Enrollment {
  id: number
  student_id: number
  student_code: string
  student_name: string
  classroom_id: number
  class_code: string
  class_name: string
  enrollment_type: EnrollmentType
  // API returns 'status', but type also supports 'enrollment_status' for compatibility
  status?: EnrollmentStatus
  enrollment_status?: EnrollmentStatus
  enrolled_date: string | null
  left_date: string | null
  notes: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EnrollmentCreateRequest {
  student_id: number
  classroom_id?: number
  enrollment_type?: EnrollmentType
  enrolled_date?: string
  notes?: string
}

export interface EnrollmentStatusUpdateRequest {
  new_status: EnrollmentStatus
  left_date?: string
  notes?: string
}

export type EnrollmentListResponse = PaginatedResponse<Enrollment>

export const CLASS_TYPE_LABEL: Record<ClassType, string> = {
  standard: 'Lớp thường',
  specialized: 'Lớp chuyên',
  advanced: 'Lớp nâng cao',
}

export const ENROLLMENT_STATUS_LABEL: Record<EnrollmentStatus, string> = {
  active: 'Đang học',
  transferred: 'Đã chuyển lớp',
  withdrawn: 'Đã rút',
  completed: 'Hoàn thành',
}

export const VALID_ENROLLMENT_STATUS_TRANSITIONS: Record<EnrollmentStatus, EnrollmentStatus[]> = {
  active: ['transferred', 'withdrawn', 'completed'],
  transferred: [],
  withdrawn: [],
  completed: [],
}
