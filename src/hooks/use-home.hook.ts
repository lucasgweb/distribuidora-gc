import { getAuthStore } from '../utils/get-auth-store.util'
import { getDashboardData, DashboardData } from '../services/dashboard.service'
import { useQuery } from '@tanstack/react-query'

export function useHome() {
  // Dados de autenticação
  const { state } = getAuthStore()
  const token = state?.token
  const user = state?.user

  const { 
    data: dashboardData,
    isLoading,
    error,
  } = useQuery<DashboardData>({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
    staleTime: 1000 * 60 * 5, // Dados considerados "frescos" por 5 minutos
    gcTime: 1000 * 60 * 15, // Mantém os dados em cache por 15 minutos
    refetchOnWindowFocus: false, // Não refaz a busca quando a janela ganha foco
  })



  return {
    token,
    user,
    dashboardData,
    isLoading,
    error,
  }
}
