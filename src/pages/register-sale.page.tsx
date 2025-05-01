/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from '../components/ui/select';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import MoneySVG from '../assets/money.svg';
import SmartPhoneSVG from '../assets/smartphone.svg';
import { ClientSearch } from '../components/client-search';
import { ClientDTO } from '../dtos/client.dto';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { X, Plus, ArrowUpCircle, ArrowDownCircle, Loader2, CheckCircle } from 'lucide-react';
import { listClients } from '../services/clients.service';
import { listProducts } from '../services/products.service';
import { ProductDTO } from '../dtos/product.dto';
import { CreateSaleDTO } from '../dtos/sale.dto';
import { createSale } from '../services/sales.service';
import { toast } from 'sonner';
import { MoneyInput } from '../components/ui/money-input';

interface OrderItem {
    item: ProductDTO;
    sold: number;
    returned: number;
    negotiatedPrice?: number;
    negotiatedCylinderPrice?: number;
}

export function RegisterSalePage() {
    const navigate = useNavigate();

    // clientes
    const [searchQuery, setSearchQuery] = useState('');
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
    const [isLoadingClients, setIsLoadingClients] = useState(false);

    // productos
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);

    // venta
    const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'YAPE'>('CASH');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmittingSale, setIsSubmittingSale] = useState(false);

    const [tempItem, setTempItem] = useState<{
        itemId: string | null;
        sold: string;
        returned: string;
        negotiatedPrice?: number;
        negotiatedCylinderPrice?: number;
    }>({ itemId: null, sold: '', returned: '' });

    // carga productos
    useEffect(() => {
        (async () => {
            setIsLoadingProducts(true);
            try {
                const res = await listProducts({});
                setProducts(res.products);
            } catch (err) {
                console.error('Error al cargar productos:', err);
            } finally {
                setIsLoadingProducts(false);
            }
        })();
    }, []);

    // busca clientes
    useEffect(() => {
        setIsLoadingClients(true);
        const h = setTimeout(async () => {
            if (searchQuery) {
                try {
                    const res = await listClients({ name: searchQuery });
                    setClients(res.clients);
                } catch (err) {
                    console.error('Error en búsqueda de clientes:', err);
                }
            } else {
                setClients([]);
            }
            setIsLoadingClients(false);
        }, 200);
        return () => clearTimeout(h);
    }, [searchQuery]);

    const openAddItemModal = () => {
        setTempItem({ itemId: null, sold: '', returned: '' });
        setIsModalOpen(true);
    };
    const addItemToOrder = () => {
        const { itemId, sold, returned, negotiatedPrice, negotiatedCylinderPrice } = tempItem;

        // Convertemos os valores para number
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
            setIsModalOpen(false);
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

    const handleSubmitSale = async () => {
        if (!selectedClient) {
            toast.info('Seleccione un cliente antes de registrar la venta!');
            return;
        }
        if (orderItems.length === 0) {
            toast.info('Agregue ítems a la venta antes de registrar!');
            return;
        }

        setIsSubmittingSale(true);
        const saleData: CreateSaleDTO = {
            clientId: selectedClient.id,
            paymentMethod: selectedPayment,
            items: orderItems.map(item => ({
                productId: item.item.id,               // id do produto
                soldQuantity: item.sold,               // quantidade vendida
                returnedQuantity: item.returned,       // quantidade devolvida
                negotiatedPrice: item.negotiatedPrice, // preço negociado (ou undefined)
                negotiatedCylinderPrice: item.negotiatedCylinderPrice, // preço do cilindro
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
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-4 pb-10 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className="space-y-6">
                    {/* Información principal */}
                    <div className="space-y-4">
                        <h2 className="text-md font-semibold">Información principal</h2>

                        <div className="space-y-2">
                            <Label>Cliente</Label>
                            <ClientSearch
                                clients={clients}
                                selectedClient={selectedClient || undefined}
                                onSelect={setSelectedClient}
                                searchQuery={searchQuery}
                                setSearchQuery={setSearchQuery}
                                isLoading={isLoadingClients}
                            />

                            {selectedClient && (
                                <div className="flex items-center gap-2 p-2 bg-primary/10 border border-primary rounded-lg">
                                    <CheckCircle className="h-4 w-4 text-primary" />
                                    <span className="text-sm ">
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
                            )}
                        </div>
                    </div>

                    {/* Información de venta */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-semibold">Información de venta</h2>
                            <Button size="sm" onClick={openAddItemModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar ítem
                            </Button>
                        </div>

                        {orderItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay ítems agregados
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                                {orderItems.map((oi, idx) => (
                                    <div key={idx} className="py-2 px-3 hover:bg-gray-50 flex justify-between items-center">
                                        <div>
                                            <span className="font-medium">{oi.item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <ArrowUpCircle className="w-4 h-4 text-green-600" />
                                            <span>{oi.sold}</span>
                                            <ArrowDownCircle className="w-4 h-4 text-red-600" />
                                            <span>{oi.returned}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium">
                                                ${(oi.negotiatedPrice ?? oi.item.basePrice) * oi.sold -
                                                    (oi.negotiatedCylinderPrice ?? oi.item.emptyCylinderPrice) * oi.returned}
                                                .00
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
                            <div className="text-right font-semibold">
                                Total: ${calculateTotal().toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Medio de pago */}
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Medio de pago</h2>
                        <RadioGroup
                            value={selectedPayment}
                            onValueChange={v => setSelectedPayment(v as any)}
                            className="flex flex-col md:flex-row gap-2"
                        >
                            {['CASH', 'YAPE'].map(method => (
                                <label
                                    key={method}
                                    htmlFor={method}
                                    className={`flex items-center space-x-3 border p-3 rounded-xl cursor-pointer flex-1 ${selectedPayment === method ? 'border-primary bg-primary/5' : ''
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

                    <Button className="w-full" onClick={handleSubmitSale}>
                        {isSubmittingSale ? <Loader2 className="h-6 w-6 animate-spin" /> : 'Registrar Venta'}
                    </Button>
                </div>
            </div>

            {/* Modal para Agregar ítem */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
                    <div className="w-full max-w-md bg-background rounded-t-2xl md:rounded-xl p-6 animate-in slide-in-from-bottom md:zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Agregar ítem</h3>
                            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <Label>Producto</Label>
                                <Select
                                    value={tempItem.itemId || ''}
                                    onValueChange={val =>
                                        setTempItem({ itemId: val, sold: '', returned: '' })
                                    }
                                    disabled={isLoadingProducts}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(p => (
                                            <SelectItem key={p.id} value={p.id}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <Label>Precio unitario (S/)</Label>
                                                <MoneyInput
                                                    value={tempItem.negotiatedPrice ?? prod.basePrice}
                                                    onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedPrice')}
                                                    disabled={!prod.allowPriceNegotiation}
                                                />
                                            </div>
                                            <div>
                                                <Label>Precio cilindro (S/)</Label>
                                                <MoneyInput
                                                    value={tempItem.negotiatedCylinderPrice ?? prod.emptyCylinderPrice}
                                                    onValueChange={(v: number) => handleMoneyChange(v, 'negotiatedCylinderPrice')}
                                                    disabled={!prod.allowCylinderNegotiation}
                                                />
                                            </div>
                                        </div>
                                    </>
                                );
                            })()}

                            <Button
                                className="w-full mt-4"
                                onClick={addItemToOrder}
                                disabled={
                                    !tempItem.itemId ||
                                    (tempItem.sold === '' && tempItem.returned === '')
                                }
                            >
                                Agregar
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
