// src/queries/inventory.ts
import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../lib/api'

interface InventoryMovement {
    id: string;
    productId: string;
    inventoryId: string;
    userId: string;
    movementType: 'ENTRY' | 'EXIT';
    cylinderType: 'FULL' | 'EMPTY';
    quantity: number;
    notes?: string;
    createdAt: string;
    user: {
        id: string;
        name: string;
    };
    product: {
        id: string;
        name: string;
    };
}

interface ListInventoryMovementsParams {
    search?: string;
    page?: number;
    pageSize?: number;
    productId?: string;
}

interface ListInventoryMovementsResponse {
    inventoryMovements: InventoryMovement[];
    total: number;
    page: number;
    pageSize: number;
}

// Keys para as queries
export const inventoryKeys = {
    all: ['inventory'] as const,
    movements: () => [...inventoryKeys.all, 'movements'] as const,
    movementsList: (filters: ListInventoryMovementsParams = {}) => 
        [...inventoryKeys.movements(), { ...filters }] as const,
}

// Função para buscar movimentos de inventário
async function fetchInventoryMovements({ 
    pageParam = 1, 
    ...rest 
}: ListInventoryMovementsParams & { pageParam?: number }): Promise<ListInventoryMovementsResponse> {
    const response = await api.get('/inventory-movements', {
        params: {
            page: pageParam,
            pageSize: rest.pageSize || 10,
            search: rest.search || undefined,
            productId: rest.productId || undefined,
        },
    });
    
    return response.data;
}

// Hook para buscar movimentos de inventário com paginação infinita
export function useInventoryMovements(params: Omit<ListInventoryMovementsParams, 'page'> = {}) {
    return useInfiniteQuery({
        queryKey: inventoryKeys.movementsList(params),
        queryFn: ({ pageParam }) => fetchInventoryMovements({ ...params, pageParam }),
        initialPageParam: 1,
        getNextPageParam: (lastPage, _, lastPageParam) => {
            const totalPages = Math.ceil(lastPage.total / lastPage.pageSize);
            return lastPageParam < totalPages ? lastPageParam + 1 : undefined;
        },
    });
}

// Tipo para criar um novo movimento de inventário
export interface CreateInventoryMovementDTO {
    productId: string;
    movementType: 'ENTRY' | 'EXIT';
    cylinderType: 'FULL' | 'EMPTY';
    quantity: number;
    notes?: string;
}

// Hook para criar um novo movimento de inventário
export function useCreateInventoryMovement() {
    const queryClient = useQueryClient();
    
    return useMutation({
        mutationFn: (data: CreateInventoryMovementDTO) => 
            api.post('/inventory-movements', data),
        onSuccess: () => {
            // Invalidar todas as queries de movimentos de inventário
            queryClient.invalidateQueries({ queryKey: inventoryKeys.movements() });
            // Também invalidar as queries de produtos já que o inventário muda
            queryClient.invalidateQueries({ queryKey: ['products'] });
        }
    });
}