import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { ClientDTO } from '../dtos/client.dto';
import { Card, CardContent } from '../components/ui/card';
import { listClients } from '../services/clients.service';
import { FullScreenLoader } from '../components/full-screen-loader';

const PAGE_SIZE = 10;

export function ClientListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadClients = useCallback(async () => {
        if (loading || !hasMore) return; // Evita chamadas desnecessárias

        setLoading(true);
        try {
            const data = await listClients({
                name: search || undefined,
                dni: search || undefined,
                page,
                pageSize: PAGE_SIZE,
            });

            // Atualiza a lista de clientes evitando duplicatas
            setClients(prev => {
                const existingIds = new Set(prev.map(c => c.id));
                const newClients = data.clients.filter(c => !existingIds.has(c.id));
                return [...prev, ...newClients];
            });

            // Define hasMore corretamente: só true se a página cheia foi retornada
            setHasMore(data.clients.length === PAGE_SIZE);

            // Log para depuração (opcional)
            // console.log(`Página ${page}: ${data.clients.length} clientes recebidos, hasMore: ${data.clients.length === PAGE_SIZE}`);
        } catch (error) {
            console.error('Erro ao carregar clientes:', error);
        } finally {
            setLoading(false);
        }
    }, [search, page, loading, hasMore]);

    // Reseta a lista quando a busca muda
    useEffect(() => {
        setClients([]);
        setPage(1);
        setHasMore(true);
        // Carrega a primeira página imediatamente após o reset
        loadClients();
    }, [search]);

    // Carrega os clientes apenas quando a página muda (exceto no reset da busca)
    useEffect(() => {
        if (page !== 1) {
            loadClients();
        }
    }, [page, loadClients]);

    // Configura o IntersectionObserver para scroll infinito
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                // Log para depuração (opcional)
                // console.log(`Observer disparado - Tentando carregar página ${page + 1}, hasMore: ${hasMore}, loading: ${loading}`);
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 }); // Ajusta o threshold para garantir que só dispare quando o elemento estiver visível

        const current = observerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [hasMore, loading]);

    return (
        <div className="flex px-4 flex-col min-h-screen">
            <Header title="Clientes" onBack={() => navigate('/')} />

            <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-1 relative">
                        <Input
                            placeholder="Buscar clientes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <Button onClick={() => navigate('/clients/new')}>
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo
                    </Button>
                </div>

                <div className="mt-4 space-y-2">
                    {clients.map(client => (
                        <Card
                            key={client.id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/clients/${client.id}`)}
                        >
                            <CardContent className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-medium text-xl">{client.name}</h3>
                                    <div className="mt-2 text-sm space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">DNI/RUC:</span>
                                            <span>{client.dni}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Teléfono:</span>
                                            <span>{client.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {loading && page === 1 && <FullScreenLoader />}
                    <div ref={observerRef} className="h-6" />
                </div>
            </div>
        </div>
    );
}