import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ArrowRight, IdCard, Loader2, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { ClientDTO } from '../dtos/client.dto';
import { Card, CardContent } from '../components/ui/card';
import { listClients } from '../services/clients.service';
import { FullScreenLoader } from '../components/full-screen-loader';
import { formatPhoneNumber } from 'react-phone-number-input';
import { useDebounce } from 'use-debounce';

const PAGE_SIZE = 10;

export function ClientListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);
    const [clients, setClients] = useState<ClientDTO[]>([]);
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

    // Atualiza as referências quando os estados mudam
    useEffect(() => {
        currentPageRef.current = page;
        loadingRef.current = loading;
        hasMoreRef.current = hasMore;
        initialLoadDoneRef.current = initialLoadDone;
    }, [page, loading, hasMore, initialLoadDone]);

    const loadClients = useCallback(async (forceReset = false) => {
        if (loadingRef.current || (!forceReset && !hasMoreRef.current)) return;

        setLoading(true);
        try {
            const currentPage = forceReset ? 1 : currentPageRef.current;

            const data = await listClients({
                search: debouncedSearch || undefined,
                page: currentPage,
                pageSize: PAGE_SIZE,
            });

            setClients(prev => {
                return currentPage === 1 ? data.clients : [...prev, ...data.clients];
            });

            setHasMore(data.total > currentPage * PAGE_SIZE);

            if (!initialLoadDoneRef.current) {
                setInitialLoadDone(true);
            }

        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoading(false);
        }
    }, [debouncedSearch]);

    // Efeito para busca - resetar e carregar a primeira página
    useEffect(() => {
        setIsSearching(true);
        setClients([]);
        setPage(1);
        currentPageRef.current = 1;
        setHasMore(true);
        setInitialLoadDone(false);

        const timer = setTimeout(() => {
            loadClients(true).finally(() => setIsSearching(false));
        }, 100);

        return () => clearTimeout(timer);
    }, [debouncedSearch, loadClients]);

    // Efeito para carregar mais clientes quando a página muda
    useEffect(() => {
        if (page !== 1) {
            loadClients();
        }
    }, [page, loadClients]);

    // Observer de interseção para paginação infinita
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting &&
                hasMoreRef.current &&
                !loadingRef.current &&
                initialLoadDoneRef.current) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 });

        const current = observerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, []);

    return (
        <div className="flex px-4 flex-col min-h-screen">
            <Header title="Clientes" onBack={() => navigate('/')} />

            <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 relative">
                        <Input
                            placeholder="Buscar por nombre, DNI o teléfono..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />

                    </div>

                    <Button onClick={() => navigate('/clients/new')}>
                        <Plus className="w-4 h-4 " />
                        Nuevo
                    </Button>
                </div>

                <div className="mt-4 space-y-3">
                    {isSearching && clients.length === 0 && (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        </div>
                    )}
                    {clients.map(client => (
                        <Card
                            key={client.id}
                            className="cursor-pointer hover:bg-gray-50 transition-colors group"
                            onClick={() => navigate(`/clients/${client.id}`)}
                        >
                            <CardContent >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h3 className="font-medium text-lg text-gray-900">
                                                {client.name}
                                            </h3>
                                        </div>
                                        <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <IdCard className="h-4 w-4 text-blue-600" />
                                                <span>
                                                    {client.document || <span className="text-gray-400">Sin documento</span>}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Phone className="h-4 w-4 text-green-600" />
                                                <span>
                                                    {client.phone ? formatPhoneNumber(client.phone) : <span className="text-gray-400">Sin teléfono</span>}
                                                </span>
                                            </div>
                                        </div>

                                        {(client.email || client.address) && (
                                            <div className="mt-3 space-y-1 text-sm text-gray-500">
                                                {client.email && (
                                                    <div className="flex items-center gap-2">
                                                        <Mail className="h-4 w-4" />
                                                        <span>{client.email}</span>
                                                    </div>
                                                )}
                                                {client.address && (
                                                    <div className="flex items-center gap-2">
                                                        <MapPin className="h-4 w-4" />
                                                        <span className="truncate">{client.address}</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {loading && page === 1 && !isSearching && <FullScreenLoader />}

                    {loading && page > 1 && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        </div>
                    )}

                    <div ref={observerRef} className="h-6" />

                    {!hasMore && clients.length > 0 && (
                        <div className="text-center py-4 text-gray-500">
                            <p>Has llegado al final de la lista</p>
                        </div>
                    )}

                    {!loading && !isSearching && clients.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gray-100 rounded-full p-4 mb-3">
                                <IdCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800">
                                {debouncedSearch ? 'Sin resultados' : 'Sin clientes registrados'}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {debouncedSearch
                                    ? 'Intenta con otros términos de búsqueda'
                                    : 'Presiona el botón "+" para crear un nuevo cliente'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}