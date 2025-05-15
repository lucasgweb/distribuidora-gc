import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Loader2, CreditCard } from 'lucide-react';
import { SaleDTO } from '../dtos/sale.dto';
import { BottomNav } from '../components/bottom-nav';
import { SaleCard } from '../components/sale-card';
import { Skeleton } from '../components/ui/skeleton';
import { useDebounce } from 'use-debounce';
import { useListSales } from '../queries/sales';

const PAGE_SIZE = 10;

// Skeleton para la tarjeta de venta
const SaleCardSkeleton = () => {
    return (
        <div className="p-4 bg-white rounded-lg border mb-3">
            <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                    <div className="flex justify-between">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                        <Skeleton className="h-4 w-4 rounded-full" />
                        <Skeleton className="h-4 w-32" />
                    </div>
                    <div className="flex gap-2">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                    </div>
                </div>
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
        </div>
    );
};

export function SalesListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [sales, setSales] = useState<SaleDTO[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isSearching, setIsSearching] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    // Referências para usar em efeitos e callbacks
    const currentPageRef = useRef(page);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const hasMoreRef = useRef(hasMore);
    const initialLoadDoneRef = useRef(initialLoadDone);

    // Obter dados usando React Query
    const {
        data: salesData,
        isLoading,
        isFetching,
        isError,
        error
    } = useListSales({
        query: debouncedSearch || undefined,
        page,
        pageSize: PAGE_SIZE
    });

    // Atualizar as referências quando os estados mudam
    useEffect(() => {
        currentPageRef.current = page;
        hasMoreRef.current = hasMore;
        initialLoadDoneRef.current = initialLoadDone;
    }, [page, hasMore, initialLoadDone]);

    // Processar dados quando recebidos do React Query
    useEffect(() => {
        if (salesData) {
            // Atualizar vendas
            setSales(prev => {
                if (page === 1) {
                    return salesData.sales;
                } else {
                    const existingIds = new Set(prev.map(s => s.id));
                    const newSales = salesData.sales.filter(s => !existingIds.has(s.id));
                    return [...prev, ...newSales];
                }
            });

            // Verificar se há mais páginas
            const totalPages = Math.ceil(salesData.total / PAGE_SIZE);
            setHasMore(page < totalPages);

            // Marcar carregamento inicial como concluído
            if (!initialLoadDone) {
                setInitialLoadDone(true);
            }
        }
    }, [salesData, page, initialLoadDone]);

    // Resetar quando a busca mudar
    useEffect(() => {
        setIsSearching(true);

        const timer = setTimeout(() => {
            setSales([]);
            setPage(1);
            currentPageRef.current = 1;
            setHasMore(true);
            setInitialLoadDone(false);
            setIsSearching(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [debouncedSearch]);

    // Configurar o observador de interseção para paginação infinita
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (
                    entries[0].isIntersecting &&
                    hasMoreRef.current &&
                    !isFetching &&
                    initialLoadDoneRef.current
                ) {
                    setPage(prev => prev + 1);
                }
            },
            { threshold: 0.5, rootMargin: '100px' }
        );

        const currentObserver = observerRef.current;
        if (currentObserver) observer.observe(currentObserver);

        return () => {
            if (currentObserver) observer.unobserve(currentObserver);
        };
    }, [isFetching]);

    // Función para renderizar los skeletons
    const renderSaleSkeletons = (count = 5) => {
        return Array(count).fill(0).map((_, index) => (
            <SaleCardSkeleton key={`skeleton-${index}`} />
        ));
    };

    return (
        <>
            <div className="flex px-4 flex-col min-h-screen mb-16">
                <Header title="Ventas" onBack={() => navigate('/')} />

                <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                    <div className="flex items-center justify-between gap-2 mb-6">
                        <div className="flex flex-1 relative">
                            <Input
                                placeholder="Buscar por cliente, código o documento..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="bg-white shadow-sm pr-8"
                            />
                        </div>
                    </div>

                    <div className="mt-4  grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Exibir mensagem de erro */}
                        {isError && (
                            <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                                <p className="font-medium">Error al cargar las ventas</p>
                                <p className="text-sm mt-1">{error?.message || 'Ha ocurrido un error inesperado'}</p>
                            </div>
                        )}

                        {/* Mostrar skeletons durante a busca */}
                        {isSearching && sales.length === 0 && renderSaleSkeletons(3)}

                        {/* Mostrar skeletons durante o carregamento inicial */}
                        {isLoading && page === 1 && !isSearching && renderSaleSkeletons(5)}

                        {/* Mostrar vendas quando estiverem carregadas */}
                        {sales.map(sale => (
                            <SaleCard sale={sale} key={sale.id} />
                        ))}

                        {/* Indicador de carregamento para paginação */}
                        {isFetching && page > 1 && (
                            <div className="flex flex-col items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                                <span className="text-sm text-gray-600">Cargando más ventas...</span>
                            </div>
                        )}

                        {/* Elemento de referência para observar o scroll */}
                        <div ref={observerRef} className="h-2" />

                        {/* Mensagem de fim da lista */}
                        {!hasMore && sales.length > 0 && (
                            <div className="text-center py-4 text-gray-500">
                                <p>Has llegado al final de la lista</p>
                                <p className="text-sm mt-1">Mostrando {sales.length} de {salesData?.total || sales.length} resultados</p>
                            </div>
                        )}

                        {/* Mensagem quando não há vendas */}
                        {!isLoading && !isSearching && sales.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-gray-100 rounded-full p-4 mb-3">
                                    <CreditCard className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">
                                    {debouncedSearch ? 'Sin resultados' : 'Sin ventas registradas'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {debouncedSearch
                                        ? 'Intenta con otros términos de búsqueda'
                                        : 'Presiona el botón "+" para crear una nueva venta'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            <BottomNav />
        </>
    );
}