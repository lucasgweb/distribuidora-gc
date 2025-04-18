// src/services/sales.service.ts

import { CreateSaleDTO, SaleDTO } from '../dtos/sale.dto'
import { api } from '../lib/api'

const BASE_URL = '/sales'

export interface ListSalesParams {
  page?: number
  pageSize?: number
}

export interface ListSalesResponse {
  sales: SaleDTO[]
  total: number
  page: number
  pageSize: number
}

export async function createSale(
  data: CreateSaleDTO
): Promise<{ saleId: string }> {
  const response = await api.post<{ saleId: string }>(BASE_URL, data)
  return response.data
}

export async function getSale(id: string): Promise<SaleDTO> {
  const response = await api.get<SaleDTO>(`${BASE_URL}/${id}`)
  return response.data
}

export async function listSales(
  params: ListSalesParams = {}
): Promise<ListSalesResponse> {
  const response = await api.get<ListSalesResponse>(BASE_URL, { params })
  return response.data
}
