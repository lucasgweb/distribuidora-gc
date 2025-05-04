// src/queries/clients.ts
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  CreateClientDTO, 
  UpdateClientDTO 
} from '../dtos/client.dto'
import { createClient, getClient, listClients, ListClientsParams, updateClient } from '../services/clients.service'


// Keys para as queries
export const clientKeys = {
  all: ['clients'] as const,
  lists: () => [...clientKeys.all, 'list'] as const,
  list: (filters: ListClientsParams) => [...clientKeys.lists(), { ...filters }] as const,
  details: () => [...clientKeys.all, 'detail'] as const,
  detail: (id: string) => [...clientKeys.details(), id] as const,
}

export function useListClients(params: ListClientsParams = {}) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => listClients(params),
  })
}

export function useInfiniteClients(params: Omit<ListClientsParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: clientKeys.lists(),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await listClients({
        ...params,
        page: pageParam,
        pageSize: 10
      })
      return result
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      return lastPage.clients.length === 0 ? undefined : lastPageParam + 1
    },
  })
}

export function useClient(id: string, p0: { enabled: boolean }) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id),
    enabled: !!id,
  })
}

export function useCreateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateClientDTO) => createClient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    }
  })
}

export function useUpdateClient() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateClientDTO) => updateClient(data),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(clientKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
    }
  })
}

export function usePrefetchClient(id: string) {
  const queryClient = useQueryClient()
  return queryClient.prefetchQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => getClient(id)
  })
}

export function usePrefetchClients(params: ListClientsParams = {}) {
  const queryClient = useQueryClient()
  return queryClient.prefetchQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => listClients(params)
  })
}