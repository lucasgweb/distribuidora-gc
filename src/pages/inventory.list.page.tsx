import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowDownCircle, ArrowUpCircle, Plus, Search } from 'lucide-react';
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

// Componente para el skeleton de un movimiento de inventario
const InventoryMovementSkeleton = () => {
    return (
        <div className="border p-4 rounded-xl animate-pulse">
            <div className="flex justify-between items-start">
                <div className="flex-1">
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-[18px] w-[18px] rounded-full" />
                        <Skeleton className="h-5 w-40" />
                    </div>
                    <Skeleton className="h-4 w-56 mt-1" />
                </div>
                <Skeleton className="h-7 w-16 rounded-md" />
            </div>

            <div className="mt-3 flex items-center">
                <Skeleton className="h-[22px] w-24 rounded-full" />
                <Skeleton className="h-[22px] w-20 rounded-full ml-2" />
            </div>

            {/* Simular notas en aproximadamente 30% de los casos */}
            {Math.random() > 0.7 && (
                <div className="mt-2">
                    <Skeleton className="h-10 w-full rounded-md" />
                </div>
            )}
        </div>
    );
};

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
        return type === 'FULL' ? 'lleno' : 'vacío';
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    };

    // Renderizar los skeletons con variedad
    const renderSkeletons = () => {
        return Array(5)
            .fill(0)
            .map((_, index) => (
                <InventoryMovementSkeleton key={`skeleton-${index}`} />
            ));
    };

    return (
        <div className="flex flex-col min-h-screen px-4 bg-white">
            <Header title="Inventario" onBack={() => navigate('/')} />
            <div className="pb-10 max-w-md mx-auto w-full">

                <div className='flex items-center flex-1 mb-4 w-full gap-2'>
                    <div className="relative w-full">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                        <Input
                            placeholder="Buscar movimientos"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <Button
                            className='w-full'
                            onClick={() => navigate('/inventory-movement')}
                        >
                            <Plus size={20} />
                            Nuevo
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    {movements.length === 0 && !pagination.isLoading ? (
                        <div className="bg-white p-6 rounded-xl shadow text-center">
                            <p className="text-gray-500">No hay movimientos de inventario.</p>
                        </div>
                    ) : (
                        movements.map((movement, index) => {
                            const isLastElement = index === movements.length - 1;
                            const isEntry = movement.movementType === 'ENTRY';
                            const isFull = movement.cylinderType === 'FULL';

                            return (
                                <div
                                    key={movement.id}
                                    ref={isLastElement ? lastMovementElementRef : null}
                                    className={`
                                        border p-4 rounded-xl 
                                    `}
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                {isEntry ? (
                                                    <ArrowDownCircle className="text-green-500" size={18} />
                                                ) : (
                                                    <ArrowUpCircle className="text-red-500" size={18} />
                                                )}
                                                <p className="font-medium">{movement.product.name}</p>
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {formatDateTime(movement.createdAt)} • {movement.user.name}
                                            </p>
                                        </div>
                                        <div className={`
                                            text-sm font-medium px-2 py-1 rounded-md
                                            ${isEntry
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-red-50 text-red-700'
                                            }
                                        `}>
                                            {getMovementTypeText(movement.movementType)}
                                        </div>
                                    </div>

                                    <div className="mt-3 flex items-center">
                                        <div className={`
                                            inline-flex items-center px-2 py-1 rounded-full text-xs
                                            ${isFull
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-yellow-100 text-yellow-800'
                                            }
                                        `}>
                                            Cilindro {getCylinderTypeText(movement.cylinderType)}
                                        </div>
                                        <div className="ml-2 px-2 py-1 rounded-full bg-gray-100 text-gray-800 text-xs">
                                            {movement.quantity} unidades
                                        </div>
                                    </div>

                                    {movement.notes && (
                                        <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded-md">
                                            "{movement.notes}"
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}

                    {pagination.isLoading && renderSkeletons()}
                </div>
            </div>
        </div>
    );
}