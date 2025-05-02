import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { Badge } from '../components/ui/badge';
import { PlusCircle, Search } from 'lucide-react';
import { api } from '../lib/api';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

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

interface PaginationState {
    page: number;
    hasMore: boolean;
    isLoading: boolean;
}

export function InventoryListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [movements, setMovements] = useState<InventoryMovement[]>([]);
    const [pagination, setPagination] = useState<PaginationState>({
        page: 1,
        hasMore: true,
        isLoading: false,
    });
    const observer = useRef<IntersectionObserver | null>(null);
    const lastMovementElementRef = useRef<HTMLDivElement | null>(null);

    // Debounce search input
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setDebouncedSearch(search);
            // Reset pagination when search changes
            setPagination({
                page: 1,
                hasMore: true,
                isLoading: false,
            });
            setMovements([]);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    const fetchMovements = useCallback(async (page: number, searchTerm: string) => {
        try {
            setPagination(prev => ({ ...prev, isLoading: true }));

            const response = await api.get('/inventory-movements', {
                params: {
                    page,
                    pageSize: 10,
                    search: searchTerm || undefined,
                },
            });

            const { inventoryMovements, total } = response.data;

            setMovements(prev =>
                page === 1 ? inventoryMovements : [...prev, ...inventoryMovements]
            );

            // Check if there are more items to load
            const hasMore = page * 10 < total;

            setPagination({
                page,
                hasMore,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error fetching inventory movements:', error);
            toast.error('No se pudieron cargar los movimientos de inventario');
            setPagination(prev => ({ ...prev, isLoading: false }));
        }
    }, []);

    // Initial load and when search changes
    useEffect(() => {
        fetchMovements(1, debouncedSearch);
    }, [fetchMovements, debouncedSearch]);

    // Setup intersection observer for infinite scrolling
    useEffect(() => {
        if (pagination.isLoading || !pagination.hasMore) return;

        if (observer.current) observer.current.disconnect();

        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && pagination.hasMore) {
                const nextPage = pagination.page + 1;
                fetchMovements(nextPage, debouncedSearch);
            }
        });

        if (lastMovementElementRef.current) {
            observer.current.observe(lastMovementElementRef.current);
        }

        return () => {
            if (observer.current) {
                observer.current.disconnect();
            }
        };
    }, [pagination.isLoading, pagination.hasMore, pagination.page, fetchMovements, debouncedSearch]);

    const getMovementTypeText = (type: 'ENTRY' | 'EXIT') => {
        return type === 'ENTRY' ? 'Entrada' : 'Salida';
    };

    const getCylinderTypeText = (type: 'FULL' | 'EMPTY') => {
        return type === 'FULL' ? 'Lleno' : 'Vacío';
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    };

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="px-6 pb-10 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between py-6">
                    <Header title="Inventario" onBack={() => navigate('/')} />
                    <Button
                        onClick={() => navigate('/inventory/movement/new')}
                        size="icon"
                        className="rounded-full"
                    >
                        <PlusCircle size={20} />
                    </Button>
                </div>

                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <Input
                        placeholder="Buscar movimientos"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-10"
                    />
                </div>

                <div className="space-y-3">
                    {movements.length === 0 && !pagination.isLoading ? (
                        <div className="bg-white p-6 rounded-xl shadow text-center">
                            <p className="text-gray-500">No hay movimientos de inventario.</p>
                        </div>
                    ) : (
                        movements.map((movement, index) => {
                            // Check if this is the last element
                            const isLastElement = index === movements.length - 1;

                            return (
                                <div
                                    key={movement.id}
                                    ref={isLastElement ? lastMovementElementRef : null}
                                    className="bg-white p-4 rounded-xl shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <p className="font-medium">{movement.product.name}</p>
                                            <p className="text-sm text-gray-500">
                                                {formatDateTime(movement.createdAt)} • {movement.user.name}
                                            </p>
                                        </div>
                                        <Badge
                                            variant={movement.movementType === 'ENTRY' ? 'default' : 'destructive'}
                                            className="capitalize"
                                        >
                                            {getMovementTypeText(movement.movementType)}
                                        </Badge>
                                    </div>
                                    <div className="mt-2">
                                        <p className="text-sm">
                                            {movement.quantity} cilindro(s) {getCylinderTypeText(movement.cylinderType)}
                                        </p>
                                        {movement.notes && (
                                            <p className="text-xs text-gray-600 mt-1 italic">"{movement.notes}"</p>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    )}

                    {pagination.isLoading && (
                        <>
                            <Skeleton className="w-full h-24 rounded-xl" />
                            <Skeleton className="w-full h-24 rounded-xl" />
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}