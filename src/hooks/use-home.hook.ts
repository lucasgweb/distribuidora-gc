import { useEffect, useState } from 'react'
import { getAuthStore } from '../utils/get-auth-store.util'
import { getDashboardData, DashboardData } from '../services/dashboard.service'

export function useHome() {
  // Dados de autenticação
  const { state } = getAuthStore()
  const token = state?.token
  const user = state?.user

  // Estados para dados do dashboard
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [isError, setIsError] = useState<boolean>(false)
  const [error, setError] = useState<unknown>(null)

  useEffect(() => {
    if (!token) return

    async function fetchDashboard() {
      setIsLoading(true)
      setIsError(false)
      try {
        const data = await getDashboardData()
        setDashboardData(data)
      } catch (err) {
        setIsError(true)
        setError(err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboard()
  }, [token])

  return {
    token,
    user,
    dashboardData,
    isLoading,
    isError,
    error,
  }
}
