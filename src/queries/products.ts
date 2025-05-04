// src/queries/products.ts
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { 
  CreateProductDTO,
  ProductDTO, 
  UpdateProductDTO 
} from '../dtos/product.dto'
import { 
  createProduct, 
  getProduct, 
  listProducts, 
  ListProductsParams, 
  ListProductsResponse, 
  updateProduct 
} from '../services/products.service'

// Keys para as queries de produtos
export const productKeys = {
  all: ['products'] as const,
  lists: () => [...productKeys.all, 'list'] as const,
  list: (filters: ListProductsParams) => [...productKeys.lists(), { ...filters }] as const,
  details: () => [...productKeys.all, 'detail'] as const,
  detail: (id: string) => [...productKeys.details(), id] as const,
}

// Hook para buscar a lista de produtos
export function useListProducts(params: ListProductsParams = {}) {
  return useQuery<ListProductsResponse>({
    queryKey: productKeys.list(params),
    queryFn: () => listProducts(params),
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}

// Hook para buscar um produto específico
export function useProduct(id: string, options = {}) {
  return useQuery<ProductDTO>({
    queryKey: productKeys.detail(id),
    queryFn: () => getProduct(id),
    staleTime: 1000 * 60 * 10, // 10 minutos
    enabled: !!id && id !== 'new',
    ...options
  })
}

// Hook para criar um produto
export function useCreateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: CreateProductDTO) => createProduct(data),
    onSuccess: () => {
      // Quando criar com sucesso, invalidar as listas de produtos
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
    }
  })
}

// Hook para atualizar um produto
export function useUpdateProduct() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: UpdateProductDTO) => updateProduct(data),
    onSuccess: (data, variables) => {
      // Atualizar o cache e invalidar as queries relevantes
      queryClient.setQueryData(productKeys.detail(variables.id), data)
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
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