import { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Loader2, Calendar, User, CreditCard } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { listSales } from '../services/sales.service';
import { SaleDTO } from '../dtos/sale.dto';
import { FullScreenLoader } from '../components/full-screen-loader';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

const PAGE_SIZE = 10;

export function SalesListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [sales, setSales] = useState<SaleDTO[]>([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const observerRef = useRef<HTMLDivElement | null>(null);

    const loadSales = useCallback(async () => {
        if (loading || !hasMore) return;

        setLoading(true);
        try {
            const data = await listSales({
                page,
                pageSize: PAGE_SIZE,
                query: search || undefined,
            });

            setSales(prev => {
                const existingIds = new Set(prev.map(s => s.id));
                const newSales = data.sales.filter(s => !existingIds.has(s.id));
                return [...prev, ...newSales];
            });

            setHasMore(data.sales.length === PAGE_SIZE);
        } catch (error) {
            console.error('Erro ao carregar ventas:', error);
        } finally {
            setLoading(false);
        }
    }, [search, page, loading, hasMore]);

    useEffect(() => {
        setSales([]);
        setPage(1);
        setHasMore(true);
        loadSales();
    }, [search]);

    useEffect(() => {
        if (page !== 1) {
            loadSales();
        }
    }, [page, loadSales]);

    // Configurar IntersectionObserver
    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore && !loading) {
                setPage(prev => prev + 1);
            }
        }, { threshold: 0.1 });

        const current = observerRef.current;
        if (current) observer.observe(current);

        return () => {
            if (current) observer.unobserve(current);
        };
    }, [hasMore, loading]);

    const getPaymentMethodLabel = (method: string) => {
        return method === 'CASH' ? 'Efectivo' : 'Yape';
    };


    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    return (
        <div className="flex px-4 flex-col min-h-screen ">
            <Header title="Ventas" onBack={() => navigate('/')} />

            <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center justify-between gap-2 mb-6">
                    <div className="flex flex-1 relative">
                        <Input
                            placeholder="Buscar ventas por cliente o ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="bg-white shadow-sm"
                        />
                    </div>

                </div>

                <div className="mt-4 space-y-3">
                    {sales.map(sale => (
                        <Card
                            key={sale.id}
                            className="cursor-pointer hover:bg-white transition-colors p-1 hover:shadow overflow-hidden bg-white"
                            onClick={() => navigate(`/sale-detail/${sale.id}`)}
                        >
                            <CardContent className="p-0">
                                <div className="flex flex-col">
                                    {/* Header with ID and Amount */}
                                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                                        <div className="flex items-center gap-2">
                                            #{sale.code}
                                            <h3 className="font-medium">
                                                {sale.client.name}
                                            </h3>
                                        </div>
                                        <span className="font-semibold text-green-600">
                                            {formatCurrency(sale.totalAmount)}
                                        </span>
                                    </div>

                                    {/* Details */}
                                    <div className="px-4 py-3">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <CreditCard className="w-4 h-4" />
                                                    {getPaymentMethodLabel(sale.paymentMethod)}

                                                </div>

                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <Calendar className="w-4 h-4" />
                                                    <span className="text-xs">
                                                        {format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm', {
                                                            locale: es
                                                        })}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">


                                                <div className="flex items-center gap-1 text-gray-600">
                                                    <User className="w-4 h-4" />
                                                    <span className="text-xs">
                                                        {sale.user.name}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {loading && page === 1 && <FullScreenLoader />}

                    {loading && page > 1 && (
                        <div className="flex justify-center py-4">
                            <Loader2 className="h-6 w-6 animate-spin" />
                        </div>
                    )}

                    <div ref={observerRef} className="h-6" />

                    {!hasMore && sales.length > 0 && (
                        <p className="text-center text-gray-500 py-4">
                            No hay más ventas para mostrar
                        </p>
                    )}

                    {!loading && sales.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-12 text-center">
                            <div className="bg-gray-100 rounded-full p-4 mb-3">
                                <CreditCard className="h-8 w-8 text-gray-400" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-800">No se encontraron ventas</h3>
                            <p className="text-sm text-gray-500 mt-1">
                                {search ? 'Prueba con otra búsqueda' : 'Registra tu primera venta para comenzar'}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}