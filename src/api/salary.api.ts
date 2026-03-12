import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type {
  SalaryGrade,
  SalaryGradeCreateRequest,
  SalaryGradeUpdateRequest,
  SalaryGradeListResponse,
  SalaryGradeQueryParams,
  BonusPolicy,
  BonusPolicyCreateRequest,
  BonusPolicyUpdateRequest,
  BonusPolicyListResponse,
  Payroll,
  PayrollCreateRequest,
  PayrollUpdateRequest,
  PayrollStatusUpdateRequest,
  AddPayrollBonusRequest,
  PayrollListResponse,
  PayrollQueryParams,
  PayrollBonus,
} from '@/types/salary.types'

export const salaryApi = {
  // ── Salary Grades ───────────────────────────────────────────────────────────
  salaryGrades: {
    list: async (params: SalaryGradeQueryParams = {}): Promise<APIResponse<SalaryGradeListResponse>> => {
      const { data } = await apiClient.get('/api/v1/salary/grades', { params })
      return data
    },
    getByCode: async (grade_code: string): Promise<APIResponse<SalaryGrade>> => {
      const { data } = await apiClient.get(`/api/v1/salary/grades/${grade_code}`)
      return data
    },
    create: async (payload: SalaryGradeCreateRequest): Promise<APIResponse<SalaryGrade>> => {
      const { data } = await apiClient.post('/api/v1/salary/grades', payload)
      return data
    },
    update: async (grade_code: string, payload: SalaryGradeUpdateRequest): Promise<APIResponse<SalaryGrade>> => {
      const { data } = await apiClient.patch(`/api/v1/salary/grades/${grade_code}`, payload)
      return data
    },
  },

  // ── Bonus Policies ──────────────────────────────────────────────────────────
  bonusPolicies: {
    list: async (params: { page?: number; page_size?: number; active_only?: boolean } = {}): Promise<APIResponse<BonusPolicyListResponse>> => {
      const { data } = await apiClient.get('/api/v1/salary/bonus-policies', { params })
      return data
    },
    getByCode: async (policy_code: string): Promise<APIResponse<BonusPolicy>> => {
      const { data } = await apiClient.get(`/api/v1/salary/bonus-policies/${policy_code}`)
      return data
    },
    create: async (payload: BonusPolicyCreateRequest): Promise<APIResponse<BonusPolicy>> => {
      const { data } = await apiClient.post('/api/v1/salary/bonus-policies', payload)
      return data
    },
    update: async (policy_code: string, payload: BonusPolicyUpdateRequest): Promise<APIResponse<BonusPolicy>> => {
      const { data } = await apiClient.patch(`/api/v1/salary/bonus-policies/${policy_code}`, payload)
      return data
    },
  },

  // ── Payrolls ────────────────────────────────────────────────────────────────
  payrolls: {
    list: async (params: PayrollQueryParams = {}): Promise<APIResponse<PayrollListResponse>> => {
      const { data } = await apiClient.get('/api/v1/salary/payrolls', { params })
      return data
    },
    getById: async (payroll_id: number): Promise<APIResponse<Payroll>> => {
      const { data } = await apiClient.get(`/api/v1/salary/payrolls/${payroll_id}`)
      return data
    },
    create: async (payload: PayrollCreateRequest): Promise<APIResponse<Payroll>> => {
      const { data } = await apiClient.post('/api/v1/salary/payrolls', payload)
      return data
    },
    update: async (payroll_id: number, payload: PayrollUpdateRequest): Promise<APIResponse<Payroll>> => {
      const { data } = await apiClient.patch(`/api/v1/salary/payrolls/${payroll_id}`, payload)
      return data
    },
    updateStatus: async (payroll_id: number, payload: PayrollStatusUpdateRequest): Promise<APIResponse<Payroll>> => {
      const { data } = await apiClient.patch(`/api/v1/salary/payrolls/${payroll_id}/status`, payload)
      return data
    },
    addBonus: async (payroll_id: number, payload: AddPayrollBonusRequest): Promise<APIResponse<PayrollBonus>> => {
      const { data } = await apiClient.post(`/api/v1/salary/payrolls/${payroll_id}/bonuses`, payload)
      return data
    },
  },
}
