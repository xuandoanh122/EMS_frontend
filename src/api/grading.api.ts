import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type {
  Subject,
  SubjectCreateRequest,
  SubjectUpdateRequest,
  SubjectListResponse,
  SubjectQueryParams,
  ClassSubject,
  ClassSubjectCreateRequest,
  ClassSubjectUpdateRequest,
  ClassSubjectListResponse,
  ClassSubjectQueryParams,
  GradeComponent,
  GradeComponentCreateRequest,
  GradeComponentUpdateRequest,
  StudentGrade,
  GradeCreateRequest,
  GradeBulkCreateRequest,
  GradeUpdateRequest,
  GradeListResponse,
  GradeQueryParams,
  GradeAuditLog,
  StudentReportResponse,
  ClassSubjectStatistics,
} from '@/types/grading.types'

export const gradingApi = {
  // ── Subjects ────────────────────────────────────────────────────────────────
  subjects: {
    list: async (params: SubjectQueryParams = {}): Promise<APIResponse<SubjectListResponse>> => {
      const { data } = await apiClient.get('/api/v1/grading/subjects', { params })
      return data
    },
    getByCode: async (subject_code: string): Promise<APIResponse<Subject>> => {
      const { data } = await apiClient.get(`/api/v1/grading/subjects/${subject_code}`)
      return data
    },
    create: async (payload: SubjectCreateRequest): Promise<APIResponse<Subject>> => {
      const { data } = await apiClient.post('/api/v1/grading/subjects', payload)
      return data
    },
    update: async (subject_code: string, payload: SubjectUpdateRequest): Promise<APIResponse<Subject>> => {
      const { data } = await apiClient.patch(`/api/v1/grading/subjects/${subject_code}`, payload)
      return data
    },
  },

  // ── Class Subjects ──────────────────────────────────────────────────────────
  classSubjects: {
    list: async (params: ClassSubjectQueryParams = {}): Promise<APIResponse<ClassSubjectListResponse>> => {
      const { data } = await apiClient.get('/api/v1/grading/class-subjects', { params })
      return data
    },
    getById: async (cs_id: number): Promise<APIResponse<ClassSubject>> => {
      const { data } = await apiClient.get(`/api/v1/grading/class-subjects/${cs_id}`)
      return data
    },
    create: async (payload: ClassSubjectCreateRequest): Promise<APIResponse<ClassSubject>> => {
      const { data } = await apiClient.post('/api/v1/grading/class-subjects', payload)
      return data
    },
    update: async (cs_id: number, payload: ClassSubjectUpdateRequest): Promise<APIResponse<ClassSubject>> => {
      const { data } = await apiClient.patch(`/api/v1/grading/class-subjects/${cs_id}`, payload)
      return data
    },
    getGrades: async (cs_id: number, params: GradeQueryParams = {}): Promise<APIResponse<GradeListResponse>> => {
      const { data } = await apiClient.get(`/api/v1/grading/class-subjects/${cs_id}/grades`, { params })
      return data
    },
    getStatistics: async (cs_id: number): Promise<APIResponse<ClassSubjectStatistics>> => {
      const { data } = await apiClient.get(`/api/v1/grading/class-subjects/${cs_id}/statistics`)
      return data
    },
  },

  // ── Grade Components ────────────────────────────────────────────────────────
  gradeComponents: {
    listByClassSubject: async (class_subject_id: number): Promise<APIResponse<GradeComponent[]>> => {
      const { data } = await apiClient.get(`/api/v1/grading/grade-components/${class_subject_id}`)
      return data
    },
    create: async (payload: GradeComponentCreateRequest): Promise<APIResponse<GradeComponent>> => {
      const { data } = await apiClient.post('/api/v1/grading/grade-components', payload)
      return data
    },
    update: async (gc_id: number, payload: GradeComponentUpdateRequest): Promise<APIResponse<GradeComponent>> => {
      const { data } = await apiClient.patch(`/api/v1/grading/grade-components/${gc_id}`, payload)
      return data
    },
  },

  // ── Student Grades ──────────────────────────────────────────────────────────
  grades: {
    getById: async (grade_id: number): Promise<APIResponse<StudentGrade>> => {
      const { data } = await apiClient.get(`/api/v1/grading/grades/${grade_id}`)
      return data
    },
    create: async (payload: GradeCreateRequest): Promise<APIResponse<StudentGrade>> => {
      const { data } = await apiClient.post('/api/v1/grading/grades', payload)
      return data
    },
    bulkCreate: async (payload: GradeBulkCreateRequest): Promise<APIResponse<StudentGrade[]>> => {
      const { data } = await apiClient.post('/api/v1/grading/grades/bulk', payload)
      return data
    },
    update: async (grade_id: number, payload: GradeUpdateRequest): Promise<APIResponse<StudentGrade>> => {
      const { data } = await apiClient.patch(`/api/v1/grading/grades/${grade_id}`, payload)
      return data
    },
    getAuditLogs: async (grade_id: number): Promise<APIResponse<GradeAuditLog[]>> => {
      const { data } = await apiClient.get(`/api/v1/grading/grades/${grade_id}/audit-logs`)
      return data
    },
  },

  // ── Reports ─────────────────────────────────────────────────────────────────
  reports: {
    getStudentReport: async (
      student_id: number,
      params: { semester?: number; academic_year?: string } = {},
    ): Promise<APIResponse<StudentReportResponse>> => {
      const { data } = await apiClient.get(`/api/v1/grading/students/${student_id}/report`, { params })
      return data
    },
  },
}
