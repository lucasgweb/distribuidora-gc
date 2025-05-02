/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
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
import { X, Plus, ArrowUpCircle, ArrowDownCircle, Loader2, CheckCircle, Search, CheckIcon } from 'lucide-react';
import { listClients } from '../services/clients.service';
import { listProducts } from '../services/products.service';
import { ProductDTO } from '../dtos/product.dto';
import { CreateSaleDTO } from '../dtos/sale.dto';
import { createSale } from '../services/sales.service';
import { toast } from 'sonner';
import { MoneyInput } from '../components/ui/money-input';
import { formatCurrency } from '../utils/format-currency';
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from '../components/ui/command';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '../components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../components/ui/dialog';
import { ScrollArea } from '../components/ui/scroll-area';
import { cn } from '../lib/utils';
import { FullScreenLoader } from '../components/full-screen-loader';

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
    const [productCommandOpen, setProductCommandOpen] = useState(false);

    // Venta
    const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'YAPE'>('CASH');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSubmittingSale, setIsSubmittingSale] = useState(false);

    const [tempItem, setTempItem] = useState<{
        itemId: string | null;
        sold: string;
        returned: string;
        negotiatedPrice?: number;
        negotiatedCylinderPrice?: number;
    }>({ itemId: null, sold: '', returned: '' });

    // Cargar productos
    useEffect(() => {
        (async () => {
            setIsLoadingProducts(true);
            try {
                const res = await listProducts({});
                setProducts(res.products);
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
        setIsDialogOpen(true);
    };

    const addItemToOrder = () => {
        const { itemId, sold, returned, negotiatedPrice, negotiatedCylinderPrice } = tempItem;

        const soldQty = parseInt(sold || '0', 10);
        const returnedQty = parseInt(returned || '0', 10);

        if (itemId && (soldQty > 0 || returnedQty > 0)) {
            const prod = products.find(p => p.id === itemId)!;
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

    const handleProductSelect = (productId: string) => {
        setTempItem(prev => ({ ...prev, itemId: productId }));
        setProductCommandOpen(false);
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
            toast.success('Venta registrada con éxito');
            navigate(`/sale-finished/${res.saleId}`);
        } catch (err) {
            console.error('Error al registrar venta:', err);
            toast.error('Error al registrar venta');
        } finally {
            setIsSubmittingSale(false);
        }
    };

    if (isLoadingProducts) return <FullScreenLoader />

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-4 pb-20 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className="space-y-6">
                    {/* Información principal */}
                    <div className="space-y-4">
                        <h2 className="text-md font-semibold">Información principal</h2>

                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            {selectedClient ? (
                                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary rounded-xl">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span className="text-sm">
                                        Cliente seleccionado: {selectedClient.name}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="ml-auto text-red-600 hover:bg-red-50"
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
                                    <div className="text-sm text-muted-foreground">
                                        Ningún cliente seleccionado
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Información de venta */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-semibold">Información de venta</h2>
                            <Button size="sm" variant="default" onClick={openAddItemDialog}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar ítem
                            </Button>
                        </div>

                        {orderItems.length === 0 ? (
                            <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                                <div className="flex flex-col items-center space-y-2">
                                    <Plus className="h-8 w-8 text-gray-400" />
                                    <div className="text-gray-500">No hay ítems agregados</div>

                                </div>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                                {orderItems.map((oi, idx) => (
                                    <div key={idx} className="py-3 px-4 hover:bg-gray-50 flex justify-between text-sm items-center">
                                        <div className="flex-1">
                                            <span className="font-medium">{oi.item.name}</span>

                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className='flex items-center gap-1'>
                                                <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                                <span>{oi.sold}</span>
                                            </div>
                                            <div className='flex items-center gap-1'>
                                                <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                                <span>{oi.returned}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 ml-2">
                                            <span className="font-medium">
                                                {formatCurrency(
                                                    (oi.negotiatedPrice ?? oi.item.basePrice) * oi.sold -
                                                    (oi.negotiatedCylinderPrice ?? oi.item.emptyCylinderPrice) * oi.returned
                                                )}
                                            </span>
                                            <Button variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                                                <X className="w-4 h-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {orderItems.length > 0 && (
                            <div className="flex justify-between items-center py-2 px-4 rounded-lg bg-gray-50 border border-gray-100 font-medium">
                                <span>Total:</span>
                                <span className="text-xl text-primary">{formatCurrency(calculateTotal())}</span>
                            </div>
                        )}
                    </div>

                    {/* Método de pago */}
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Método de pago</h2>
                        <RadioGroup
                            value={selectedPayment}
                            onValueChange={v => setSelectedPayment(v as any)}
                            className="flex flex-col md:flex-row gap-2"
                        >
                            {['CASH', 'YAPE'].map(method => (
                                <label
                                    key={method}
                                    htmlFor={method}
                                    className={`flex items-center space-x-3 border p-3 rounded-xl cursor-pointer flex-1 ${selectedPayment === method ? 'border-primary bg-primary/5' : 'hover:bg-gray-50'
                                        }`}
                                >
                                    <RadioGroupItem value={method} id={method} className="sr-only" />
                                    <div
                                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === method ? 'border-primary bg-primary' : 'border-gray-300'
                                            }`}
                                    >
                                        {selectedPayment === method && <div className="w-2 h-2 rounded-full bg-white" />}
                                    </div>
                                    <img
                                        src={method === 'CASH' ? MoneySVG : SmartPhoneSVG}
                                        alt={method}
                                        className="h-4 w-4"
                                    />
                                    <span className="font-normal">
                                        {method === 'CASH' ? 'Efectivo' : 'Yape'}
                                    </span>
                                </label>
                            ))}
                        </RadioGroup>
                    </div>

                    <Button
                        className="w-full py-6 text-lg"
                        onClick={handleSubmitSale}
                        disabled={isSubmittingSale || orderItems.length === 0 || !selectedClient}
                    >
                        {isSubmittingSale ? <Loader2 className="h-6 w-6 animate-spin mr-2" /> : null}
                        Registrar Venta
                    </Button>
                </div>
            </div>

            {/* Dialog para agregar artículo */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Agregar ítem</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Producto</Label>
                            <Popover open={productCommandOpen} onOpenChange={setProductCommandOpen}>
                                <PopoverTrigger asChild>
                                    <Button
                                        variant="outline"
                                        role="combobox"
                                        aria-expanded={productCommandOpen}
                                        className="w-full justify-between font-normal"
                                    >
                                        {tempItem.itemId
                                            ? products.find(p => p.id === tempItem.itemId)?.name
                                            : "Seleccionar producto"}
                                        <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                    </Button>
                                </PopoverTrigger>
                                <PopoverContent className="p-0 w-[300px]" align="start">
                                    <Command
                                        filter={(value, search) => {
                                            const product = products.find(p => p.id === value);
                                            return product?.name.toLowerCase().includes(search.toLowerCase()) ? 1 : 0;
                                        }}
                                    >
                                        <CommandInput
                                            placeholder="Buscar ítem..."
                                        />
                                        <CommandList>
                                            <CommandEmpty>No se encontraron ítems</CommandEmpty>
                                            <CommandGroup>
                                                <ScrollArea className="h-64">
                                                    {products.map((product) => (
                                                        <CommandItem
                                                            key={product.id}
                                                            value={product.id}
                                                            onSelect={handleProductSelect}
                                                            className="flex items-center justify-between"
                                                        >
                                                            <div>
                                                                <span>{product.name}</span>
                                                            </div>
                                                            {product.id === tempItem.itemId && (
                                                                <CheckIcon className="h-4 w-4 text-primary" />
                                                            )}
                                                        </CommandItem>
                                                    ))}
                                                </ScrollArea>
                                            </CommandGroup>
                                        </CommandList>
                                    </Command>
                                </PopoverContent>
                            </Popover>
                        </div>

                        {(() => {
                            const prod = products.find(p => p.id === tempItem?.itemId)!;
                            return (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label>Vendidos</Label>
                                            <Input
                                                disabled={!tempItem?.itemId}
                                                type="text"
                                                inputMode="numeric"
                                                pattern="[0-9]*"
                                                value={tempItem?.sold}
                                                onChange={e => handleQtyChange(e, 'sold')}
                                                className="bg-white"
                                            />
                                        </div>
                                        <div>
                                            <Label>Devueltos</Label>
                                            <Input
                                                disabled={!tempItem.itemId}
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
                                            <Label className={cn(!prod?.allowPriceNegotiation && "text-gray-500")}>
                                                Precio unitario (S/)
                                                {!prod?.allowPriceNegotiation && " (Fijo)"}
                                            </Label>
                                            <MoneyInput
                                                value={tempItem?.negotiatedPrice ?? prod?.basePrice}
                                                onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedPrice')}
                                                disabled={!prod?.allowPriceNegotiation || !tempItem?.itemId}
                                            />
                                        </div>
                                        <div>
                                            <Label className={cn(!prod?.allowCylinderNegotiation && "text-gray-500")}>
                                                Precio cilindro (S/)
                                                {!prod?.allowCylinderNegotiation && " (Fijo)"}
                                            </Label>
                                            <MoneyInput
                                                value={tempItem?.negotiatedCylinderPrice ?? prod?.emptyCylinderPrice}
                                                onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedCylinderPrice')}
                                                disabled={!prod?.allowCylinderNegotiation || !tempItem?.itemId}
                                            />
                                        </div>
                                    </div>

                                    {prod && (
                                        <div className="text-sm bg-gray-50 p-2 rounded-md">
                                            <div className="flex justify-between">
                                                <span>Subtotal:</span>
                                                <span>
                                                    {formatCurrency(
                                                        parseInt(tempItem?.sold || '0', 10) * (tempItem?.negotiatedPrice ?? prod?.basePrice) -
                                                        parseInt(tempItem?.returned || '0', 10) * (tempItem?.negotiatedCylinderPrice ?? prod?.emptyCylinderPrice)
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </>
                            );
                        })()}

                        <div className="flex justify-end gap-2 mt-6">
                            <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                            </DialogClose>
                            <Button
                                onClick={addItemToOrder}
                                disabled={
                                    !tempItem.itemId ||
                                    (parseInt(tempItem?.sold || '0', 10) === 0 && parseInt(tempItem?.returned || '0', 10) === 0)
                                }
                            >
                                Agregar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}