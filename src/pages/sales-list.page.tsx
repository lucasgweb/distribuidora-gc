import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Loader2, CreditCard } from 'lucide-react';
import { listSales } from '../services/sales.service';
import { SaleDTO } from '../dtos/sale.dto';
import { BottomNav } from '../components/bottom-nav';
import { SaleCard } from '../components/sale-card';
import { FullScreenLoader } from '../components/full-screen-loader';
import { useDebounce } from 'use-debounce';

const PAGE_SIZE = 10;

export function SalesListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [sales, setSales] = useState<SaleDTO[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [initialLoadDone, setInitialLoadDone] = useState(false);

    const currentPageRef = useRef(page);
    const observerRef = useRef<HTMLDivElement | null>(null);
    const loadingRef = useRef(loading);
    const hasMoreRef = useRef(hasMore);
    const initialLoadDoneRef = useRef(initialLoadDone);

    useEffect(() => {
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        currentPageRef.current = page;
        initialLoadDoneRef.current = initialLoadDone;
    }, [loading, hasMore, page, initialLoadDone]);

    const loadSales = useCallback(async (forceReset = false) => {
        if (loadingRef.current || (!forceReset && !hasMoreRef.current)) return;

        setLoading(true);
        try {
            const currentPage = forceReset ? 1 : currentPageRef.current;

            const data = await listSales({
                query: debouncedSearch || undefined,
                page: currentPage,
                pageSize: PAGE_SIZE,
            });

            setSales(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const newSales = data.sales.filter(s => !existingIds.has(s.id));
                return forceReset ? newSales : [...prev, ...newSales];
            });

            const totalPages = Math.ceil(data.total / PAGE_SIZE);
            setHasMore(currentPage < totalPages);

            if (!initialLoadDoneRef.current) {
                setInitialLoadDone(true);
            }

        } catch (error) {
            console.error('Error al cargar ventas:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    // Carregamento inicial ou quando a busca mudar
    useEffect(() => {
        const controller = new AbortController();
        setIsSearching(true);

        const timer = setTimeout(() => {
            setSales([]);
            setPage(1);
            currentPageRef.current = 1;
            setHasMore(true);
            setInitialLoadDone(false);
            loadSales(true).finally(() => setIsSearching(false));
        }, 150);

        return () => {
            controller.abort();
            clearTimeout(timer);
        };
    }, [debouncedSearch, loadSales]);

    // Carregamento quando a página mudar (scroll infinito)
    useEffect(() => {
        if (page === 1) return;
        loadSales();
    }, [page, loadSales]);

    // Configuração do observador de interseção para o scroll infinito
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting &&
                    hasMoreRef.current &&
                    !loadingRef.current &&
                    initialLoadDoneRef.current) {
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
    }, []);

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
                            {isSearching && (
                                <Loader2 className="absolute right-2 top-3 h-4 w-4 animate-spin text-gray-500" />
                            )}
                        </div>
                    </div>

                    <div className="mt-4 space-y-3">
                        {isSearching && sales.length === 0 && (
                            <div className="flex flex-col items-center py-6">
                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                <span className="text-sm text-gray-600">Buscando ventas...</span>
                            </div>
                        )}

                        {sales.map(sale => (
                            <SaleCard sale={sale} key={sale.id} />
                        ))}

                        {loading && page === 1 && !isSearching && <FullScreenLoader />}

                        {loading && page > 1 && (
                            <div className="flex flex-col items-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mb-2" />
                                <span className="text-sm text-gray-600">Cargando más ventas...</span>
                            </div>
                        )}

                        <div ref={observerRef} className="h-2" />

                        {!hasMore && sales.length > 0 && (
                            <div className="text-center py-4 text-gray-500">
                                <p>Has llegado al final de la lista</p>
                                <p className="text-sm mt-1">Mostrando {sales.length} de {sales.length} resultados</p>
                            </div>
                        )}

                        {!loading && sales.length === 0 && (
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