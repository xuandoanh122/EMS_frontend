import apiClient from './client'
import type { APIResponse } from '@/types/api.types'
import type { DashboardStats } from '@/types/dashboard.types'

export const dashboardApi = {
  getStats: async (): Promise<APIResponse<DashboardStats>> => {
    const { data } = await apiClient.get('/api/v1/dashboard/stats')
    return data
  },
}
