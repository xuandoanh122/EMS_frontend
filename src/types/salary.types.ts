import type { PaginatedResponse, QueryParams } from './api.types'

export type QualificationLevel = 'dai_hoc' | 'thac_si' | 'tien_si' | 'giao_su'
export type ExperienceTier = 'under_3y' | '3_to_6y' | '6_to_10y' | 'over_10y'
export type BonusType = 'fixed' | 'percentage'
export type PayrollStatus = 'draft' | 'confirmed' | 'paid'

// ── SalaryGrade ───────────────────────────────────────────────────────────────
export interface SalaryGrade {
  id: number
  grade_code: string
  qualification_level: QualificationLevel
  experience_tier: ExperienceTier
  base_salary: number
  hourly_rate: number
  effective_from: string
  effective_to: string | null
  description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface SalaryGradeCreateRequest {
  grade_code: string
  qualification_level: QualificationLevel
  experience_tier: ExperienceTier
  base_salary: number
  hourly_rate: number
  effective_from: string
  effective_to?: string
  description?: string
}

export type SalaryGradeUpdateRequest = Partial<Omit<SalaryGradeCreateRequest, 'grade_code' | 'qualification_level' | 'experience_tier'>> & {
  is_active?: boolean
}

export type SalaryGradeListResponse = PaginatedResponse<SalaryGrade>

export interface SalaryGradeQueryParams extends QueryParams {
  active_only?: boolean
}

// ── BonusPolicy ───────────────────────────────────────────────────────────────
export interface BonusPolicy {
  id: number
  policy_code: string
  policy_name: string
  bonus_type: BonusType
  bonus_value: number
  condition_description: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface BonusPolicyCreateRequest {
  policy_code: string
  policy_name: string
  bonus_type?: BonusType
  bonus_value: number
  condition_description?: string
}

export type BonusPolicyUpdateRequest = Partial<Omit<BonusPolicyCreateRequest, 'policy_code'>> & {
  is_active?: boolean
}

export type BonusPolicyListResponse = PaginatedResponse<BonusPolicy>

// ── Payroll ───────────────────────────────────────────────────────────────────
export interface PayrollBonus {
  id: number
  payroll_id: number
  bonus_policy_id: number
  policy_name: string
  bonus_type: BonusType
  amount: number
  note: string | null
}

export interface Payroll {
  id: number
  teacher_id: number
  teacher_code: string
  teacher_name: string
  salary_grade_id: number
  grade_code: string
  payroll_month: string
  status: PayrollStatus
  work_days_standard: number
  work_days_actual: number
  teaching_hours_standard: number
  teaching_hours_actual: number
  base_salary: number
  teaching_allowance: number
  total_bonus: number
  deductions: number
  net_salary: number
  notes: string | null
  confirmed_by: number | null
  bonus_details: PayrollBonus[]
  created_at: string
  updated_at: string
}

export interface PayrollCreateRequest {
  teacher_id: number
  salary_grade_id: number
  payroll_month: string
  work_days_standard?: number
  work_days_actual?: number
  teaching_hours_standard?: number
  teaching_hours_actual?: number
  base_salary?: number
  teaching_allowance?: number
  deductions?: number
  notes?: string
  bonus_details?: {
    bonus_policy_id: number
    amount: number
    note?: string
  }[]
}

export type PayrollUpdateRequest = Partial<Pick<PayrollCreateRequest,
  'work_days_actual' | 'teaching_hours_actual' | 'teaching_allowance' | 'deductions' | 'notes'
>>

export interface PayrollStatusUpdateRequest {
  new_status: PayrollStatus
  confirmed_by?: number
  notes?: string
}

export interface AddPayrollBonusRequest {
  bonus_policy_id: number
  amount: number
  note?: string
}

export type PayrollListResponse = PaginatedResponse<Payroll>

export interface PayrollQueryParams extends QueryParams {
  teacher_id?: number
  status?: PayrollStatus
  month_from?: string
  month_to?: string
}

// ── Labels ────────────────────────────────────────────────────────────────────
export const QUALIFICATION_LEVEL_LABEL: Record<QualificationLevel, string> = {
  dai_hoc: 'Đại học',
  thac_si: 'Thạc sĩ',
  tien_si: 'Tiến sĩ',
  giao_su: 'Giáo sư',
}

export const EXPERIENCE_TIER_LABEL: Record<ExperienceTier, string> = {
  under_3y: 'Dưới 3 năm',
  '3_to_6y': '3 – 6 năm',
  '6_to_10y': '6 – 10 năm',
  over_10y: 'Trên 10 năm',
}

export const PAYROLL_STATUS_LABEL: Record<PayrollStatus, string> = {
  draft: 'Nháp',
  confirmed: 'Đã duyệt',
  paid: 'Đã thanh toán',
}

export const PAYROLL_STATUS_COLOR: Record<PayrollStatus, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  paid: 'bg-green-100 text-green-700',
}

export const VALID_PAYROLL_STATUS_TRANSITIONS: Record<PayrollStatus, PayrollStatus[]> = {
  draft: ['confirmed'],
  confirmed: ['paid'],
  paid: [],
}
