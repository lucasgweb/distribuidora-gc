import { CreateProductDTO, ProductDTO, UpdateProductDTO } from '../dtos/product.dto'
import { api } from '../lib/api'

const BASE_URL = '/products'

export async function createProduct(
  data: CreateProductDTO,
): Promise<void> {
  await api.post<void>(BASE_URL, data)
}

export async function getProduct(
  id: string,
): Promise<ProductDTO> {
  const response = await api.get<ProductDTO>(`${BASE_URL}/${id}`)
  return response.data
}

export interface ListProductsParams {
  name?: string
}

export interface ListProductsResponse {
  products: ProductDTO[]
}

export async function listProducts(
  params: ListProductsParams = {},
): Promise<ListProductsResponse> {
  const response = await api.get<ListProductsResponse>(BASE_URL, {
    params,
  })
  return response.data
}

export async function updateProduct(
  data: UpdateProductDTO,
): Promise<ProductDTO> {
  const { id, ...rest } = data
  const response = await api.put<ProductDTO>(
    `${BASE_URL}/${id}`,
    rest,
  )
  return response.data
}
