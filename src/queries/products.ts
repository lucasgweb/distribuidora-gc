import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  ProductDTO, 
} from '../dtos/product.dto'
import { 
  createProduct, 
  getProduct, 
  listProducts, 
  ListProductsParams, 
  ListProductsResponse, 
  updateProduct 
} from '../services/products.service'

export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ListProductsParams) => [...productKeys.lists(), { ...filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

export function useListProducts(params: ListProductsParams = {}) {
  return useQuery<ListProductsResponse>({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    staleTime: 1000 * 60 * 5, 
  })
}

export function useProduct(id: string, options = {}) {
  return useQuery<ProductDTO>({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    staleTime: 1000 * 60 * 10, 
    enabled: !!id && id !== 'new',
    ...options
  })
}

export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    }
  })
}

// Hook para atualizar um produto - ajustado para void
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: updateProduct,
    onSuccess: () => {
      // Limpar todo o cache de produtos para garantir dados atualizados
      queryClient.invalidateQueries({ queryKey: productKeys.all })
    }
  })
}

// Funções utilitárias para prefetch
export function usePrefetchProduct(id: string) {
  const queryClient = useQueryClient()
  return () => {
    if (id && id !== 'new') {
      queryClient.prefetchQuery({
        queryKey: productKeys.detail(id),
        queryFn: () => getProduct(id)
      })
    }
  }
}

export function usePrefetchProducts(params: ListProductsParams = {}) {
  const queryClient = useQueryClient()
  return () => {
    queryClient.prefetchQuery({
      queryKey: productKeys.list(params),
      queryFn: () => listProducts(params)
    })
  }
}