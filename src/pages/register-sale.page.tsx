/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import MoneySVG from '../assets/money.svg';
import SmartPhoneSVG from '../assets/smartphone.svg';
import { ClientSearch } from '../components/client-search';
import { ClientDTO } from '../dtos/client.dto';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import {
    X, Plus, ArrowUpCircle, ArrowDownCircle, Loader2,
    CheckCircle, Search, CheckIcon, Info, ShoppingCart,
    Trash2
} from 'lucide-react';
import { listClients } from '../services/clients.service';
import { listProducts } from '../services/products.service';
import { ProductDTO } from '../dtos/product.dto';
import { CreateSaleDTO } from '../dtos/sale.dto';
import { createSale } from '../services/sales.service';
import { toast } from 'sonner';
import { MoneyInput } from '../components/ui/money-input';
import { formatCurrency } from '../utils/format-currency';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { FullScreenLoader } from '../components/full-screen-loader';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

interface OrderItem {
    item: ProductDTO;
    sold: number;
    returned: number;
    negotiatedPrice?: number;
    negotiatedCylinderPrice?: number;
}

export function RegisterSalePage() {
    const navigate = useNavigate();

    // Clientes
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
    const [isLoadingClients, setIsLoadingClients] = useState(false);

    // Productos
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [productSearch, setProductSearch] = useState('');
    const [filteredProducts, setFilteredProducts] = useState<ProductDTO[]>([]);
    const [recentlyUsedProducts, setRecentlyUsedProducts] = useState<ProductDTO[]>([]);

    // Venta
    const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'YAPE'>('CASH');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmittingSale, setIsSubmittingSale] = useState(false);
    const [editingItemIndex, setEditingItemIndex] = useState<number | null>(null);

    // Producto selector dialog
    const [isProductDialogOpen, setIsProductDialogOpen] = useState(false);
    const [selectedTab, setSelectedTab] = useState('todos');

    // Confirmación de venta
    const [isConfirmationDialogOpen, setIsConfirmationDialogOpen] = useState(false);

    const [tempItem, setTempItem] = useState<{
        itemId: string | null;
        sold: string;
        returned: string;
        negotiatedPrice?: number;
        negotiatedCylinderPrice?: number;
    }>({ itemId: null, sold: '', returned: '' });

    // Actualiza productos filtrados cuando cambia la búsqueda
    useEffect(() => {
        if (!productSearch.trim()) {
            if (selectedTab === 'todos') {
                setFilteredProducts(products);
            } else if (selectedTab === 'recentes') {
                setFilteredProducts(recentlyUsedProducts);
            }
            return;
        }

        const searchLower = productSearch.toLowerCase();
        const productsToFilter = selectedTab === 'recentes' ? recentlyUsedProducts : products;

        const filtered = productsToFilter.filter(p =>
            p.name.toLowerCase().includes(searchLower)
        );

        setFilteredProducts(filtered);
    }, [productSearch, products, selectedTab, recentlyUsedProducts]);

    // Cargar productos
    useEffect(() => {
        (async () => {
            setIsLoadingProducts(true);
            try {
                const res = await listProducts({});
                setProducts(res.products);
                setFilteredProducts(res.products);

                // Simulando produtos usados recentemente (normalmente seria carregado de localStorage ou API)
                if (res.products.length > 0) {
                    const recentProducts = res.products.slice(0, Math.min(5, res.products.length));
                    setRecentlyUsedProducts(recentProducts);
                }
            } catch (err) {
                console.error('Error al cargar productos:', err);
                toast.error('Error al cargar productos');
            } finally {
                setIsLoadingProducts(false);
            }
        })();
    }, []);

    // Buscar clientes
    useEffect(() => {
        setIsLoadingClients(true);
        const h = setTimeout(async () => {
            if (searchQuery) {
                try {
                    const res = await listClients({ search: searchQuery });
                    setClients(res.clients);
                } catch (err) {
                    console.error('Error en búsqueda de clientes:', err);
                    toast.error('Error al buscar clientes');
                }
            } else {
                setClients([]);
            }
            setIsLoadingClients(false);
        }, 200);
        return () => clearTimeout(h);
    }, [searchQuery]);

    const openAddItemDialog = () => {
        setTempItem({ itemId: null, sold: '', returned: '' });
        setProductSearch('');
        setFilteredProducts(selectedTab === 'recentes' ? recentlyUsedProducts : products);
        setEditingItemIndex(null);
        setIsDialogOpen(true);
    };

    const openEditItemDialog = (index: number) => {
        const item = orderItems[index];
        setTempItem({
            itemId: item.item.id,
            sold: item.sold.toString(),
            returned: item.returned.toString(),
            negotiatedPrice: item.negotiatedPrice,
            negotiatedCylinderPrice: item.negotiatedCylinderPrice
        });
        setEditingItemIndex(index);
        setIsDialogOpen(true);
    };

    const openProductDialog = () => {
        setProductSearch('');
        setSelectedTab('todos');
        setFilteredProducts(products);
        setIsProductDialogOpen(true);
    };

    const handleProductSelect = (productId: string) => {
        const product = products.find(p => p.id === productId);
        setTempItem(prev => ({
            ...prev,
            itemId: productId,
            // Pre-preencher com valores padrão para melhor usabilidade
            sold: prev.sold || '1',
            returned: prev.returned || '0',
            negotiatedPrice: product?.basePrice,
            negotiatedCylinderPrice: product?.emptyCylinderPrice
        }));
        setIsProductDialogOpen(false);
    };

    const updateOrderItem = () => {
        const { itemId, sold, returned, negotiatedPrice, negotiatedCylinderPrice } = tempItem;

        const soldQty = parseInt(sold || '0', 10);
        const returnedQty = parseInt(returned || '0', 10);

        if (itemId && (soldQty > 0 || returnedQty > 0)) {
            const prod = products.find(p => p.id === itemId)!;

            // Atualizar um item existente
            if (editingItemIndex !== null) {
                setOrderItems(prev => {
                    const newItems = [...prev];
                    newItems[editingItemIndex] = {
                        item: prod,
                        sold: soldQty,
                        returned: returnedQty,
                        negotiatedPrice,
                        negotiatedCylinderPrice,
                    };
                    return newItems;
                });
            }
            // Adicionar novo item
            else {
                setOrderItems(prev => [
                    ...prev,
                    {
                        item: prod,
                        sold: soldQty,
                        returned: returnedQty,
                        negotiatedPrice,
                        negotiatedCylinderPrice,
                    },
                ]);

                // Adicionar aos produtos recentes se não estiver lá
                if (!recentlyUsedProducts.some(p => p.id === prod.id)) {
                    setRecentlyUsedProducts(prev => [prod, ...prev.slice(0, 4)]);
                }
            }

            setIsDialogOpen(false);
        } else {
            if (!itemId) {
                toast.warning('Seleccione un producto');
                return;
            }
            toast.warning('Ingrese al menos una cantidad de venta o devolución');
        }
    };

    const removeItem = (i: number) => {
        setOrderItems(prev => prev.filter((_, idx) => idx !== i));
    };

    const calculateTotal = () =>
        orderItems.reduce((sum, { sold, returned, item, negotiatedPrice, negotiatedCylinderPrice }) => {
            const price = negotiatedPrice ?? item.basePrice;
            const cylPrice = negotiatedCylinderPrice ?? item.emptyCylinderPrice;
            return sum + sold * price - returned * cylPrice;
        }, 0);

    const totalItems = useMemo(() =>
        orderItems.reduce((sum, item) => sum + item.sold + item.returned, 0),
        [orderItems]
    );

    const handleQtyChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        field: 'sold' | 'returned'
    ) => {
        const val = e.target.value;
        if (/^\d*$/.test(val)) {
            setTempItem(prev => ({ ...prev, [field]: val }));
        }
    };

    const handleMoneyChange = (
        value: number,
        field: 'negotiatedPrice' | 'negotiatedCylinderPrice'
    ) => {
        setTempItem(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmitSale = async () => {
        if (!selectedClient) {
            toast.info('¡Seleccione un cliente antes de registrar la venta!');
            return;
        }
        if (orderItems.length === 0) {
            toast.info('¡Agregue artículos a la venta antes de registrar!');
            return;
        }

        setIsSubmittingSale(true);
        const saleData: CreateSaleDTO = {
            clientId: selectedClient.id,
            paymentMethod: selectedPayment,
            items: orderItems.map(item => ({
                productId: item.item.id,
                soldQuantity: item.sold,
                returnedQuantity: item.returned,
                negotiatedPrice: item.negotiatedPrice,
                negotiatedCylinderPrice: item.negotiatedCylinderPrice,
            })),
        };

        try {
            const res = await createSale(saleData);
            navigate(`/sale-finished/${res.saleId}`);
        } catch (err) {
            console.error('Error al registrar venta:', err);
            toast.error('Error al registrar venta');
        } finally {
            setIsSubmittingSale(false);
            setIsConfirmationDialogOpen(false);
        }
    };



    if (isLoadingProducts) return <FullScreenLoader />;

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="px-4 pb-20 max-w-2xl mx-auto w-full flex-1">
                <Header
                    title="Registrar Venta"
                    onBack={() => navigate('/')}
                />

                <div className="space-y-4 mt-4">
                    {/* Información principal */}
                    <Card>
                        <CardHeader className='-mb-4'>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <CheckCircle className="h-5 w-5 text-primary" />
                                Cliente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {selectedClient ? (
                                <div className="flex items-center gap-2 bg-primary/10 border border-primary rounded-xl py-3 px-2">
                                    <CheckCircle className="h-4 w-4 text-primary " />
                                    <span className="font-medium">
                                        {selectedClient.name}
                                    </span>
                                    {selectedClient.phone && (
                                        <span className="text-sm text-gray-500 ml-1">
                                            ({selectedClient.phone})
                                        </span>
                                    )}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-red-600 hover:bg-red-50 p-1 h-auto"
                                        onClick={() => setSelectedClient(null)}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <>
                                    <ClientSearch
                                        clients={clients}
                                        selectedClient={undefined}
                                        onSelect={setSelectedClient}
                                        searchQuery={searchQuery}
                                        setSearchQuery={setSearchQuery}
                                        isLoading={isLoadingClients}
                                    />
                                    <div className="text-sm text-muted-foreground mt-2">
                                        Introduzca el nombre del cliente para buscarlo
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className='-mb-4'>
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Método de pago
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <RadioGroup
                                value={selectedPayment}
                                onValueChange={v => setSelectedPayment(v as any)}
                                className="flex flex-col sm:flex-row gap-2"
                            >
                                {[
                                    { value: 'CASH', label: 'Efectivo', icon: MoneySVG },
                                    { value: 'YAPE', label: 'Yape', icon: SmartPhoneSVG }
                                ].map(method => (
                                    <label
                                        key={method.value}
                                        htmlFor={method.value}
                                        className={`flex items-center space-x-3 border p-3 rounded-xl cursor-pointer flex-1 transition-all ${selectedPayment === method.value
                                            ? 'border-primary bg-primary/5'
                                            : 'hover:bg-gray-50'
                                            }`}
                                    >
                                        <RadioGroupItem value={method.value} id={method.value} className="sr-only" />
                                        <div
                                            className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === method.value
                                                ? 'border-primary bg-primary'
                                                : 'border-gray-300'
                                                }`}
                                        >
                                            {selectedPayment === method.value && (
                                                <div className="w-2 h-2 rounded-full bg-white" />
                                            )}
                                        </div>
                                        <img
                                            src={method.icon}
                                            alt={method.value}
                                            className="h-5 w-5"
                                        />
                                        <span className="font-medium">{method.label}</span>
                                    </label>
                                ))}
                            </RadioGroup>
                        </CardContent>
                    </Card>

                    {/* Información de venta */}
                    <Card>
                        <CardHeader className="-mb-4 flex flex-row items-center justify-between">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShoppingCart className="h-5 w-5 text-primary" />
                                Ítems ({orderItems.length})
                            </CardTitle>
                            <Button size="sm" variant="default" onClick={openAddItemDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar ítem
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-2">
                            {orderItems.length === 0 ? (
                                <div className="text-center py-10 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                                    <div className="flex flex-col items-center space-y-2">
                                        <ShoppingCart className="h-12 w-12 text-gray-400" />
                                        <div className="text-gray-500 font-medium">No hay ítems agregados</div>
                                        <Button
                                            variant="outline"
                                            className="mt-2"
                                            onClick={openAddItemDialog}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            Agregar el primer ítem
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                    {orderItems.map((oi, idx) => (
                                        <div
                                            key={idx}
                                            className="py-3 px-4 hover:bg-gray-50 flex justify-between text-sm items-center"
                                            onClick={() => openEditItemDialog(idx)}
                                        >
                                            <div className="flex-1">
                                                <span className="font-medium">{oi.item.name}</span>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className='flex items-center gap-1'>
                                                                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                                                <span>{oi.sold}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Vendidos: {oi.sold} unidades</p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatCurrency(oi.negotiatedPrice ?? oi.item.basePrice)} c/u
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>

                                                <TooltipProvider>
                                                    <Tooltip>
                                                        <TooltipTrigger asChild>
                                                            <div className='flex items-center gap-1'>
                                                                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                                                <span>{oi.returned}</span>
                                                            </div>
                                                        </TooltipTrigger>
                                                        <TooltipContent>
                                                            <p>Devueltos: {oi.returned} unidades</p>
                                                            <p className="text-xs text-gray-500">
                                                                {formatCurrency(oi.negotiatedCylinderPrice ?? oi.item.emptyCylinderPrice)} c/u
                                                            </p>
                                                        </TooltipContent>
                                                    </Tooltip>
                                                </TooltipProvider>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                <span className="font-medium">
                                                    {formatCurrency(
                                                        (oi.negotiatedPrice ?? oi.item.basePrice) * oi.sold -
                                                        (oi.negotiatedCylinderPrice ?? oi.item.emptyCylinderPrice) * oi.returned
                                                    )}
                                                </span>
                                                <div className="flex">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-7 w-7 text-gray-500 hover:text-red-600"
                                                        onClick={(e) => {
                                                            e.preventDefault()
                                                            e.stopPropagation()
                                                            removeItem(idx)
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {orderItems.length > 0 && (
                                <div className="mt-4 flex flex-col space-y-2">
                                    <div className="flex justify-between items-center py-2 px-4 rounded-lg mt-2 font-bold">
                                        <span>Total:</span>
                                        <span className="text-xl text-gray-950">{formatCurrency(calculateTotal())}</span>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Button
                        className="w-full py-6 text-lg  transition-all"
                        onClick={() => setIsConfirmationDialogOpen(true)}
                        disabled={isSubmittingSale || orderItems.length === 0 || !selectedClient}
                    >
                        {isSubmittingSale ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
                        Registrar Venta
                    </Button>
                </div>
            </div >

            {/* Dialog para agregar/editar artículo */}
            < Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen} >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>
                            {editingItemIndex !== null ? 'Editar ítem' : 'Agregar ítem'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <Button
                                variant="outline"
                                className="w-full justify-between font-normal"
                                onClick={openProductDialog}
                                disabled={editingItemIndex !== null}
                            >
                                {tempItem.itemId
                                    ? products.find(p => p.id === tempItem.itemId)?.name
                                    : "Seleccionar producto"}
                                <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                        </div>

                        {tempItem.itemId && (() => {
                            const prod = products.find(p => p.id === tempItem.itemId)!;
                            return (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Vendidos</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={tempItem.sold}
                                                onChange={e => handleQtyChange(e, 'sold')}
                                                className="bg-white"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <Label>Devueltos</Label>
                                            <Input
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={tempItem.returned}
                                                onChange={e => handleQtyChange(e, 'returned')}
                                                className="bg-white"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <Label className={cn(!prod.allowPriceNegotiation && "text-gray-500")}>
                                                    Precio unitario (S/)
                                                </Label>
                                                {!prod.allowPriceNegotiation && (
                                                    <Badge variant="outline" className="text-xs">Fijo</Badge>
                                                )}
                                            </div>
                                            <MoneyInput
                                                value={tempItem.negotiatedPrice ?? prod.basePrice}
                                                onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedPrice')}
                                                disabled={!prod.allowPriceNegotiation}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <Label className={cn(!prod.allowCylinderNegotiation && "text-gray-500")}>
                                                    Precio cilindro (S/)
                                                </Label>
                                                {!prod.allowCylinderNegotiation && (
                                                    <Badge variant="outline" className="text-xs">Fijo</Badge>
                                                )}
                                            </div>
                                            <MoneyInput
                                                value={tempItem.negotiatedCylinderPrice ?? prod.emptyCylinderPrice}
                                                onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedCylinderPrice')}
                                                disabled={!prod.allowCylinderNegotiation}
                                            />
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 p-3 rounded-md space-y-1 border">
                                        <div className="flex justify-between text-sm">
                                            <span>Venta:</span>
                                            <span>
                                                {formatCurrency(
                                                    parseInt(tempItem.sold || '0', 10) * (tempItem.negotiatedPrice ?? prod.basePrice)
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span>Devolución:</span>
                                            <span className="text-red-600">
                                                -{formatCurrency(
                                                    parseInt(tempItem.returned || '0', 10) * (tempItem.negotiatedCylinderPrice ?? prod.emptyCylinderPrice)
                                                )}
                                            </span>
                                        </div>
                                        <div className="flex justify-between font-medium pt-1 border-t mt-1">
                                            <span>Total:</span>
                                            <span>
                                                {formatCurrency(
                                                    parseInt(tempItem.sold || '0', 10) * (tempItem.negotiatedPrice ?? prod.basePrice) -
                                                    parseInt(tempItem.returned || '0', 10) * (tempItem.negotiatedCylinderPrice ?? prod.emptyCylinderPrice)
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </>
                            );
                        })()}

                        <DialogFooter className="mt-6">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancelar
                            </Button>
                            <Button
                                onClick={updateOrderItem}
                                disabled={
                                    !tempItem.itemId ||
                                    (parseInt(tempItem.sold || '0', 10) === 0 && parseInt(tempItem.returned || '0', 10) === 0)
                                }
                            >
                                {editingItemIndex !== null ? 'Guardar cambios' : 'Agregar'}
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Dialog para seleccionar producto */}
            < Dialog open={isProductDialogOpen} onOpenChange={setIsProductDialogOpen} >
                <DialogContent className="max-w-md p-0">
                    <div className="p-4 pb-0">
                        <DialogTitle className="text-lg font-semibold mb-2">Seleccionar producto</DialogTitle>
                        <div className="relative mb-2">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Buscar producto..."
                                value={productSearch}
                                onChange={(e) => setProductSearch(e.target.value)}
                                className="pl-8 bg-white"
                                autoFocus
                            />
                        </div>
                    </div>

                    <ScrollArea className="h-[50vh] border-t border-b mt-2">
                        <div className="divide-y">
                            {filteredProducts.length === 0 ? (
                                <div className="py-6 text-center text-gray-500">
                                    No se encontraron productos
                                </div>
                            ) : (
                                filteredProducts.map((product) => (
                                    <div
                                        key={product.id}
                                        className={cn(
                                            "flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50",
                                            product.id === tempItem.itemId && "bg-primary/5"
                                        )}
                                        onClick={() => handleProductSelect(product.id)}
                                    >
                                        <div>
                                            <div className="font-medium">{product.name}</div>
                                            <div className="flex items-center gap-3 mt-1">
                                                <div className="text-xs font-medium text-primary">
                                                    {formatCurrency(product.basePrice)}
                                                </div>
                                            </div>
                                        </div>
                                        {product.id === tempItem.itemId && (
                                            <CheckIcon className="h-4 w-4 text-primary" />
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </ScrollArea>

                    <div className="p-4 flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsProductDialogOpen(false)}>
                            Cancelar
                        </Button>
                    </div>
                </DialogContent>
            </Dialog >

            {/* Dialog de confirmación de venta */}
            < Dialog open={isConfirmationDialogOpen} onOpenChange={setIsConfirmationDialogOpen} >
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Confirmar venta</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-4">
                        <div className="flex flex-col space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">Cliente:</span>
                                <span>{selectedClient?.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Método de pago:</span>
                                <span>{selectedPayment === 'CASH' ? 'Efectivo' : 'Yape'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Ítems:</span>
                                <span>{orderItems.length} ({totalItems} unidades)</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg pt-2 border-t mt-2">
                                <span>Total:</span>
                                <span className="text-primary">{formatCurrency(calculateTotal())}</span>
                            </div>
                        </div>

                        <div className="bg-amber-50 p-3 rounded-md border border-amber-200 text-amber-800 text-sm">
                            <div className="flex items-start gap-2">
                                <Info className="h-4 w-4 mt-0.5" />
                                <div>
                                    <p className="font-medium">¿Está seguro de registrar esta venta?</p>
                                    <p className="mt-1">Una vez registrada, la venta no podrá ser editada directamente.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmationDialogOpen(false)}>
                            Revisar venta
                        </Button>
                        <Button
                            onClick={handleSubmitSale}
                            disabled={isSubmittingSale}
                            className="min-w-28"
                        >
                            {isSubmittingSale ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                'Confirmar'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog >
        </div >
    );
}