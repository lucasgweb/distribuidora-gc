import { ClientDTO, CreateClientDTO, UpdateClientDTO } from '../dtos/client.dto'
import { api } from '../lib/api'

const BASE_URL = '/clients'

export async function createClient(
  data: CreateClientDTO,
): Promise<void> {
  await api.post<void>(BASE_URL, data)
}

export async function getClient(
  id: string,
): Promise<ClientDTO> {
  const response = await api.get<ClientDTO>(`${BASE_URL}/${id}`)
  return response.data
}

export interface ListClientsParams {
  search?: string
  page?: number
  pageSize?: number
}

export interface ListClientsResponse {
  clients: ClientDTO[]
  total: number
}

export async function listClients(
  params: ListClientsParams = {},
): Promise<ListClientsResponse> {
  const response = await api.get<ListClientsResponse>(BASE_URL, {
    params,
  })
  return response.data
}

export async function updateClient(
  data: UpdateClientDTO,
): Promise<ClientDTO> {
  const { id, ...rest } = data
  const response = await api.put<ClientDTO>(
    `${BASE_URL}/${id}`,
    rest,
  )
  return response.data
}
