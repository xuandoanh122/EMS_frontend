import type { PaginatedResponse, QueryParams } from './api.types'

export type SubjectType = 'standard' | 'elective' | 'extra'
export type AcademicRank = 'Gioi' | 'Kha' | 'TrungBinh' | 'Yeu'

// ── Subject ──────────────────────────────────────────────────────────────────
export interface Subject {
  id: number
  subject_code: string
  subject_name: string
  subject_type: SubjectType
  credits: number
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SubjectCreateRequest {
  subject_code: string
  subject_name: string
  subject_type?: SubjectType
  credits?: number
  description?: string
}

export type SubjectUpdateRequest = Partial<Omit<SubjectCreateRequest, 'subject_code'>> & {
  is_active?: boolean
}

export type SubjectListResponse = PaginatedResponse<Subject>

export interface SubjectQueryParams extends QueryParams {
  active_only?: boolean
}

// ── ClassSubject ──────────────────────────────────────────────────────────────
export interface ClassSubject {
  id: number
  classroom_id: number
  class_code: string
  class_name: string
  subject_id: number
  subject_code: string
  subject_name: string
  teacher_id: number | null
  teacher_code: string | null
  teacher_name: string | null
  semester: 1 | 2
  academic_year: string
  is_active: boolean
  created_at: string
}

export interface ClassSubjectCreateRequest {
  classroom_id: number
  subject_id: number
  teacher_id?: number
  semester: 1 | 2
  academic_year: string
}

export type ClassSubjectUpdateRequest = {
  teacher_id?: number
  is_active?: boolean
}

export type ClassSubjectListResponse = PaginatedResponse<ClassSubject>

export interface ClassSubjectQueryParams extends QueryParams {
  classroom_id?: number
  teacher_id?: number
  academic_year?: string
  semester?: 1 | 2
}

// ── GradeComponent ────────────────────────────────────────────────────────────
export interface GradeComponent {
  id: number
  class_subject_id: number
  component_name: string
  weight_percent: number
  min_count: number
  is_active: boolean
  created_at: string
}

export interface GradeComponentCreateRequest {
  class_subject_id: number
  component_name: string
  weight_percent: number
  min_count?: number
}

export type GradeComponentUpdateRequest = Partial<Omit<GradeComponentCreateRequest, 'class_subject_id'>> & {
  is_active?: boolean
}

// ── StudentGrade ──────────────────────────────────────────────────────────────
export interface StudentGrade {
  id: number
  student_id: number
  student_code: string
  student_name: string
  class_subject_id: number
  grade_component_id: number
  component_name: string
  score: number
  exam_date: string | null
  entered_by: number | null
  created_at: string
  updated_at: string
}

export interface GradeCreateRequest {
  student_id: number
  class_subject_id: number
  grade_component_id: number
  score: number
  exam_date?: string
  entered_by?: number
}

export interface GradeBulkCreateRequest {
  class_subject_id: number
  grade_component_id: number
  exam_date?: string
  entered_by?: number
  grades: { student_id: number; score: number }[]
}

export interface GradeUpdateRequest {
  score: number
  reason: string
  modified_by?: number
}

export type GradeListResponse = PaginatedResponse<StudentGrade>

export interface GradeQueryParams extends QueryParams {
  grade_component_id?: number
}

// ── Audit Log ─────────────────────────────────────────────────────────────────
export interface GradeAuditLog {
  id: number
  grade_id: number
  old_score: number
  new_score: number
  reason: string
  modified_by: number | null
  created_at: string
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface SemesterAverageResponse {
  subject_id: number
  subject_code: string
  subject_name: string
  class_subject_id: number
  average_score: number | null
  rank: AcademicRank | null
  components: {
    component_name: string
    weight_percent: number
    scores: number[]
    average: number | null
  }[]
}

export interface StudentReportResponse {
  student_id: number
  student_code: string
  student_name: string
  semester: number | null
  academic_year: string | null
  subjects: SemesterAverageResponse[]
  overall_average: number | null
  overall_rank: AcademicRank | null
}

export interface ClassSubjectStatistics {
  class_subject_id: number
  classroom_id: number
  class_name: string
  subject_id: number
  subject_name: string
  semester: number
  academic_year: string
  total_students: number
  avg_score: number | null
  max_score: number | null
  min_score: number | null
  rank_distribution: Record<AcademicRank, number>
}

// ── Labels ────────────────────────────────────────────────────────────────────
export const SUBJECT_TYPE_LABEL: Record<SubjectType, string> = {
  standard: 'Bắt buộc',
  elective: 'Tự chọn',
  extra: 'Ngoại khóa',
}

export const ACADEMIC_RANK_LABEL: Record<AcademicRank, string> = {
  Gioi: 'Giỏi',
  Kha: 'Khá',
  TrungBinh: 'Trung Bình',
  Yeu: 'Yếu',
}

export const ACADEMIC_RANK_COLOR: Record<AcademicRank, string> = {
  Gioi: 'bg-blue-100 text-blue-700',
  Kha: 'bg-green-100 text-green-700',
  TrungBinh: 'bg-yellow-100 text-yellow-700',
  Yeu: 'bg-red-100 text-red-700',
}
