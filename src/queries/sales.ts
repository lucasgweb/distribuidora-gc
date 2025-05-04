
import { useMutation, useQuery, useQueryClient, useInfiniteQuery, keepPreviousData } from '@tanstack/react-query'
import { CreateSaleDTO, SaleDTO } from '../dtos/sale.dto'
import { 
  createSale, 
  getSale, 
  listSales, 
  ListSalesParams,
  ListSalesResponse 
} from '../services/sales.service'
import { clientKeys } from './clients'
import { productKeys } from './products'

export const saleKeys = {
  all: ['sales'] as const,
  lists: () => [...saleKeys.all, 'list'] as const,
  list: (filters: ListSalesParams = {}) => [...saleKeys.lists(), { ...filters }] as const,
  details: () => [...saleKeys.all, 'detail'] as const,
  detail: (id: string) => [...saleKeys.details(), id] as const,
}

/**
 * Hook para buscar a lista de vendas com paginação e filtros
 */
export function useListSales(params: ListSalesParams = {}) {
  return useQuery<ListSalesResponse>({
    queryKey: saleKeys.list(params),
    queryFn: () => listSales(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
    placeholderData: keepPreviousData // Usa a função keepPreviousData em vez da propriedade
  })
}

/**
 * Hook para buscar uma venda específica pelo ID
 */
export function useSale(id: string, options = {}) {
  return useQuery<SaleDTO>({
    queryKey: saleKeys.detail(id),
    queryFn: () => getSale(id),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!id, // Só executa a query se houver um ID
    ...options
  })
}

/**
 * Hook para criar uma nova venda
 */
export function useCreateSale() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateSaleDTO) => createSale(data),
    onSuccess: () => {
      // Após criar uma venda, invalidar as listas de clientes e produtos
      // para atualizar possíveis contadores e estatísticas
      queryClient.invalidateQueries({ queryKey: clientKeys.lists() })
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      queryClient.invalidateQueries({ queryKey: saleKeys.lists() })
      
      // Se tiver queries de dashboard ou relatórios, invalidar também
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
    }
  })
}

/**
 * Hook para pré-carregar os detalhes de uma venda
 */
export function usePrefetchSale(id: string) {
  const queryClient = useQueryClient()
  
  return () => {
    if (id) {
      queryClient.prefetchQuery({
        queryKey: saleKeys.detail(id),
        queryFn: () => getSale(id)
      })
    }
  }
}

/**
 * Hook para pré-carregar uma lista de vendas
 */
export function usePrefetchSales(params: ListSalesParams = {}) {
  const queryClient = useQueryClient()
  
  return () => {
    queryClient.prefetchQuery({
      queryKey: saleKeys.list(params),
      queryFn: () => listSales(params)
    })
  }
}

/**
 * Hook para pagination infinita de vendas
 */
export function useInfiniteSales(params: Omit<ListSalesParams, 'page'> = {}) {
  return useInfiniteQuery({
    queryKey: saleKeys.lists(),
    queryFn: async ({ pageParam = 1 }) => {
      const result = await listSales({
        ...params,
        page: pageParam,
        pageSize: params.pageSize || 10
      })
      return result
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage, _, lastPageParam) => {
      const totalPages = Math.ceil(lastPage.total / lastPage.pageSize)
      return lastPageParam < totalPages ? lastPageParam + 1 : undefined
    },
  })
}