import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { CheckCircle2, Plus, Search, Cylinder, ArrowLeftRight, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Skeleton } from '../components/ui/skeleton';
import { BottomNav } from '../components/bottom-nav';
import { useListProducts } from '../queries/products';
import { formatCurrency } from '../utils/format-currency';

export function ProductListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    // Usar o hook do React Query para buscar produtos
    const { data, isLoading, error } = useListProducts();

    // Array de produtos ou array vazio se data for undefined
    const products = data?.products || [];

    // Filtrar produtos com base na busca
    const filtered = products.filter(product =>
        product.name.toLowerCase().includes(search.toLowerCase())
    );



    return (
        <>
            <div className="flex flex-col px-4 max-w-6xl mx-auto min-h-screen bg-white">
                <Header title="Productos" showMenu />
                <div className="pt-4 mx-auto w-full pb-24">
                    <div className="flex items-center w-full justify-between gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                            <Input
                                placeholder="Buscar productos..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button onClick={() => navigate('/products/new')} className="bg-primary hover:bg-primary">
                            <Plus size={18} className="mr-2" />
                            Nuevo
                        </Button>
                    </div>

                    <div className="mt-4 space-y-2">
                        {/* Estado de erro */}
                        {error && (
                            <div className="text-center py-6 bg-red-50 rounded-lg">
                                <p className="text-red-500">Error al cargar productos. Por favor, intente de nuevo.</p>
                            </div>
                        )}

                        {/* Estado de carregamento - Skeleton melhorado */}
                        {isLoading ? (
                            <>
                                {[1, 2, 3, 4].map((item) => (
                                    <Card key={item} className="overflow-hidden border-gray-200">
                                        <CardContent className="p-4">
                                            {/* Header and title */}
                                            <div className="flex justify-between items-center mb-2">
                                                <Skeleton className="h-5 w-2/3" />
                                                <Skeleton className="h-4 w-4 rounded-full" />
                                            </div>

                                            {/* Price information */}
                                            <div className="flex justify-between mt-2">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-20" />
                                                    <Skeleton className="h-4 w-24" />
                                                </div>
                                                <div className="flex gap-1">
                                                    <Skeleton className="h-5 w-12 rounded-md" />
                                                    <Skeleton className="h-5 w-12 rounded-md" />
                                                </div>
                                            </div>

                                            {/* Inventory section */}
                                            <div className="mt-3 pt-2 border-t border-gray-100 flex justify-between">
                                                <div className="flex gap-3">
                                                    <div className="flex items-center">
                                                        <Skeleton className="h-4 w-4 mr-1 rounded-full" />
                                                        <Skeleton className="h-4 w-16" />
                                                    </div>
                                                    <div className="flex items-center">
                                                        <Skeleton className="h-4 w-4 mr-1 rounded-full" />
                                                        <Skeleton className="h-4 w-16" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-6 w-24 rounded-md" />
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </>
                        ) : filtered.length === 0 ? (
                            <div className="text-center py-6 bg-gray-50 rounded-lg">
                                <p className="text-gray-500">No se encontraron productos.</p>
                            </div>
                        ) : (
                            filtered.map(product => (
                                <Card
                                    key={product.id}
                                    className="cursor-pointer hover:shadow-sm transition-shadow overflow-hidden border-gray-200"
                                    onClick={() => navigate(`/products/${product.id}`)}
                                >
                                    <CardContent>
                                        <div className="flex justify-between items-center">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="font-semibold text-base text-gray-800">{product.name}</h3>
                                                    <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-gray-700 transition-colors" />
                                                </div>

                                                <div className="flex items-center gap-2 mt-1 text-sm">

                                                    <div className='flex flex-col'>

                                                        <span className="text-primary-600 font-medium">{formatCurrency(product.basePrice)}</span>

                                                        <span className="text-gray-600">Balón: {formatCurrency(product.emptyCylinderPrice)}</span>
                                                    </div>

                                                    <div className="ml-auto flex items-center gap-2">
                                                        {product.allowPriceNegotiation && (
                                                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                                <span>P.Neg</span>
                                                            </div>
                                                        )}
                                                        {product.allowCylinderNegotiation && (
                                                            <div className="flex items-center gap-1 text-xs bg-gray-100 px-1.5 py-0.5 rounded">
                                                                <CheckCircle2 className="w-3 h-3 text-green-600" />
                                                                <span>B.Neg</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Inventory Section - Compact */}
                                        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex items-center gap-1">
                                                    <Cylinder size={14} className="text-primary-500" />
                                                    <span className="text-xs font-medium text-gray-600">Llenos:</span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {product.inventory ? product.inventory.fullCylinders : 0}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Cylinder size={14} className="text-gray-400" />
                                                    <span className="text-xs font-medium text-gray-600">Vacíos:</span>
                                                    <span className="text-sm font-medium text-gray-800">
                                                        {product.inventory ? product.inventory.emptyCylinders : 0}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* Botão de inventário melhorado */}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs text-primary border-primary  hover:bg-primary-50 px-2 py-0 flex items-center gap-1"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    navigate(`/inventory-movement?productId=${product.id}`);
                                                }}
                                            >
                                                <ArrowLeftRight size={14} />
                                                <span>Inventario</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>
                </div>
            </div>
            <BottomNav />
        </>
    );
}