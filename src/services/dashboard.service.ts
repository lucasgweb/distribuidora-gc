import { SaleDTO } from '../dtos/sale.dto'
import { api } from '../lib/api'

export interface SalesByDay {
  day: string // "D", "L", "M", "M", "J", "V", "S"
  total: number
}

export interface RecentOrder {
  orderId: number
  quantity: number
  totalPrice: number
}

// Resposta do Dashboard
export interface DashboardData {
  totalSalesAmount: number
  totalOrders: number
  salesComparison: number
  ordersComparison: number
  salesByDay: SalesByDay[]
  recentSales: SaleDTO[]
}

// Função para pegar dados do Dashboard
export async function getDashboardData(): Promise<DashboardData> {
  const response = await api.get<DashboardData>('/dashboard')
  return response.data
}
