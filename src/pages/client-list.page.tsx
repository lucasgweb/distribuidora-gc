import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { ArrowRight, IdCard, Loader2, Mail, MapPin, Phone, Plus } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { formatPhoneNumber } from 'react-phone-number-input';
import { useDebounce } from 'use-debounce';
import { BottomNav } from '../components/bottom-nav';
import { useInfiniteClients } from '../queries/clients';

export function ClientListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [debouncedSearch] = useDebounce(search, 300);

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError
    } = useInfiniteClients({
        search: debouncedSearch || undefined,
        pageSize: 10,
    });

    const clients = data ? data.pages.flatMap(page => page.clients) : [];

    const observerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        }, { threshold: 0.1 });

        const current = observerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

    const renderClientSkeletons = (count = 5) => {
        return Array(count).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden">
                <CardContent>
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                            <Skeleton className="h-6 w-40 mb-3" />

                            <div className="mt-3 grid grid-cols-2 gap-2">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>

                            <div className="mt-3 space-y-1">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-32" />
                                </div>
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                    <Skeleton className="h-4 w-48" />
                                </div>
                            </div>
                        </div>
                        <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                </CardContent>
            </Card>
        ));
    };

    return (
        <>
            <div className="flex px-4 flex-col min-h-screen">
                <Header title="Clientes" showMenu />

                <div className="pt-4 pb-14 max-w-6xl mx-auto w-full">
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

                    <div className="mt-4 gap-3 grid grid-cols-1 md:grid-cols-2 mb-20">
                        {/* Mostrar skeletons durante o carregamento inicial */}
                        {isLoading ? renderClientSkeletons() : null}

                        {/* Mostrar mensagem de erro */}
                        {isError && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-red-100 rounded-full p-4 mb-3">
                                    <IdCard className="h-8 w-8 text-red-400" />
                                </div>
                                <h3 className="text-lg font-medium text-red-800">Error al cargar los clientes</h3>
                                <p className="text-sm text-red-500 mt-1">
                                    Intenta recargar la página
                                </p>
                            </div>
                        )}

                        {/* Mostrar clientes quando estão carregados */}
                        {clients.map(client => (
                            <Card
                                key={client.id}
                                className="cursor-pointer hover:bg-gray-50 transition-colors group"
                                onClick={() => navigate(`/clients/${client.id}`)}
                            >
                                <CardContent>
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

                        {/* Mostrar loader ao carregar mais páginas */}
                        {isFetchingNextPage && (
                            <div className="flex justify-center py-4">
                                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            </div>
                        )}

                        {/* Elemento observado para a paginação infinita */}
                        <div ref={observerRef} className="h-6" />

                        {/* Mostrar mensagem quando não há resultados */}
                        {!isLoading && clients.length === 0 && (
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
            <BottomNav />
        </>
    );
}