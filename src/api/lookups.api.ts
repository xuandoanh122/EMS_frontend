import apiClient from './client'
import type { APIResponse } from '@/types/api.types'

export interface LookupItem {
  id: number
  label: string
  sub_label?: string
}

export interface LookupParams {
  search?: string
  limit?: number
}

export const lookupsApi = {
  teachers: async (params: LookupParams = {}): Promise<APIResponse<LookupItem[]>> => {
    const { data } = await apiClient.get('/api/v1/lookups/teachers', { params })
    return data
  },
  classrooms: async (params: LookupParams = {}): Promise<APIResponse<LookupItem[]>> => {
    const { data } = await apiClient.get('/api/v1/lookups/classrooms', { params })
    return data
  },
  students: async (params: LookupParams = {}): Promise<APIResponse<LookupItem[]>> => {
    const { data } = await apiClient.get('/api/v1/lookups/students', { params })
    return data
  },
  subjects: async (params: LookupParams = {}): Promise<APIResponse<LookupItem[]>> => {
    const { data } = await apiClient.get('/api/v1/lookups/subjects', { params })
    return data
  },
}
