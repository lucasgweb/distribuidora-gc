
import { useQuery } from '@tanstack/react-query'
import { api } from '../lib/api'
import { DashboardData } from '../services/dashboard.service'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  details: () => [...dashboardKeys.all, 'details'] as const,
}

const fetchDashboardData = async (): Promise<DashboardData> => {
  const response = await api.get<DashboardData>('/dashboard')
  return response.data
}

export function useDashboardData() {
  return useQuery({
    queryKey: dashboardKeys.details(),
    queryFn: fetchDashboardData,
  })
}