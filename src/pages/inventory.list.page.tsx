import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Skeleton } from '../components/ui/skeleton';
import { ArrowDownCircle, ArrowUpCircle, Plus, Search } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { BottomNav } from '../components/bottom-nav';
import { useDebounce } from 'use-debounce';
import { useInventoryMovements } from '../queries/inventory';

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
    const [debouncedSearch] = useDebounce(search, 500);

    // Referência para o último item da lista (para o Intersection Observer)
    const lastMovementElementRef = useRef<HTMLDivElement | null>(null);

    // Usando o hook de query para buscar os movimentos de inventário
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInventoryMovements({
        search: debouncedSearch,
        pageSize: 10
    });

    // Juntar todos os movimentos de todas as páginas em um único array
    const movements: InventoryMovement[] = data
        ? data.pages.flatMap(page => page.inventoryMovements)
        : [];

    // Configurar o Intersection Observer manualmente
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                    fetchNextPage();
                }
            },
            { threshold: 0.5, rootMargin: '100px' }
        );

        const currentElement = lastMovementElementRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

    const getMovementTypeText = (type: 'ENTRY' | 'EXIT') => {
        return type === 'ENTRY' ? 'Entrada' : 'Salida';
    };

    const getCylinderTypeText = (type: 'FULL' | 'EMPTY') => {
        return type === 'FULL' ? 'lleno' : 'vacío';
    };

    const formatDateTime = (dateString: string) => {
        return format(new Date(dateString), 'dd MMM yyyy, HH:mm', { locale: es });
    };

    // Renderizar os skeletons com variedade
    const renderSkeletons = () => {
        return Array(5)
            .fill(0)
            .map((_, index) => (
                <InventoryMovementSkeleton key={`skeleton-${index}`} />
            ));
    };

    // Mostrar mensagem de erro se ocorrer
    if (isError) {
        toast.error('No se pudieron cargar los movimientos de inventario');
    }

    return (
        <>
            <div className="flex flex-col min-h-screen px-4 bg-white">
                <Header title="Inventario" showMenu />
                <div className="pb-10 max-w-6xl mx-auto w-full mt-3">
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
                        {isLoading ? (
                            // Mostrar skeletons durante o carregamento inicial
                            renderSkeletons()
                        ) : movements.length === 0 ? (
                            // Mostrar mensagem quando não há movimentos
                            <div className="bg-white p-6 rounded-xl shadow text-center">
                                <p className="text-gray-500">No hay movimientos de inventario.</p>
                            </div>
                        ) : (
                            // Renderizar a lista de movimentos
                            <>
                                {movements.map((movement, index) => {
                                    const isEntry = movement.movementType === 'ENTRY';
                                    const isFull = movement.cylinderType === 'FULL';
                                    const isLastElement = index === movements.length - 1;

                                    return (
                                        <div
                                            key={movement.id}
                                            ref={isLastElement ? lastMovementElementRef : null}
                                            className="border p-4 rounded-xl"
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
                                })}

                                {/* Indicador de carregamento ao buscar mais dados */}
                                {isFetchingNextPage && (
                                    <div className="flex justify-center py-4">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                                    </div>
                                )}

                                {/* Mensagem quando não há mais páginas */}
                                {!hasNextPage && movements.length > 0 && (
                                    <div className="text-center py-4 text-sm text-gray-500">
                                        No hay más movimientos de inventario para mostrar.
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
            <BottomNav />
        </>
    );
}