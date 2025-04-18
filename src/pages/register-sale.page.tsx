import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import MoneySVG from '../assets/money.svg';
import SmartPhoneSVG from '../assets/smartphone.svg';
import { ClientSearch } from '../components/client-search';
import { ClientDTO } from '../dtos/client.dto';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { X, Plus, ArrowUpCircle, ArrowDownCircle, Loader2 } from 'lucide-react';
import { listClients } from '../services/clients.service';
import { listProducts } from '../services/products.service';
import { ProductDTO } from '../dtos/product.dto';
import { CreateSaleDTO, CreateSaleItemDTO } from '../dtos/sale.dto';
import { createSale } from '../services/sales.service';

interface OrderItem {
    item: ProductDTO;
    sold: number;
    returned: number;
    negotiatedPrice?: number;
    negotiatedCylinderPrice?: number;
}

export function RegisterSalePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [clients, setClients] = useState<ClientDTO[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientDTO | null>(null);
    const [isLoadingClients, setIsLoadingClients] = useState(false);
    const [products, setProducts] = useState<ProductDTO[]>([]);
    const [isLoadingProducts, setIsLoadingProducts] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'CASH' | 'YAPE'>('CASH');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSubmitingSale, setIsSubmitingSale] = useState(false);
    const [tempItem, setTempItem] = useState<{
        itemId: string | null;
        sold: number;
        returned: number;
        negotiatedPrice?: number;
        negotiatedCylinderPrice?: number;
    }>({ itemId: null, sold: 0, returned: 0 });

    useEffect(() => {
        const loadProducts = async () => {
            try {
                setIsLoadingProducts(true);
                const response = await listProducts({});
                setProducts(response.products);
            } catch (error) {
                console.error("Erro ao carregar produtos:", error);
            } finally {
                setIsLoadingProducts(false);
            }
        };
        loadProducts();
    }, []);

    const searchClients = async (query: string) => {
        console.log(query)
        try {
            setIsLoadingClients(true);
            const response = await listClients({ name: query });
            setClients(response.clients);
        } catch (error) {
            console.error("Erro na busca de clientes:", error);
        } finally {
            setIsLoadingClients(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            if (searchQuery.length > 2) {
                searchClients(searchQuery);
            }
        }, 500);

        return () => clearTimeout(handler);
    }, [searchQuery]);

    const openAddItemModal = () => {
        setTempItem({ itemId: null, sold: 0, returned: 0 });
        setIsModalOpen(true);
    };

    const addItemToOrder = () => {
        if (tempItem.itemId && (tempItem.sold > 0 || tempItem.returned > 0)) {
            const selectedItem = products.find(item => item.id === tempItem.itemId);
            if (selectedItem) {
                const newItem: OrderItem = {
                    item: selectedItem,
                    sold: tempItem.sold,
                    returned: tempItem.returned,
                    negotiatedPrice: tempItem.negotiatedPrice,
                    negotiatedCylinderPrice: tempItem.negotiatedCylinderPrice
                };
                setOrderItems(prev => [...prev, newItem]);
                setIsModalOpen(false);
            }
        }
    };

    const removeItem = (index: number) => {
        setOrderItems(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = () => {
        return orderItems.reduce((total, { sold, returned, item, negotiatedPrice, negotiatedCylinderPrice }) => {
            const price = negotiatedPrice ?? item.basePrice;
            const cylinderPrice = negotiatedCylinderPrice ?? item.emptyCylinderPrice;
            return total + (sold * price - returned * cylinderPrice);
        }, 0);
    };
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sold' | 'returned' | 'negotiatedPrice' | 'negotiatedCylinderPrice') => {
        const value = e.target.value;

        // Permite campo vazio temporariamente
        if (value === '') {
            setTempItem(prev => ({ ...prev, [field]: undefined }));
            return;
        }

        const numValue = parseFloat(value);
        if (!isNaN(numValue)) {
            setTempItem(prev => ({ ...prev, [field]: numValue >= 0 ? numValue : 0 }));
        }
    };

    const handleSubmitSale = async () => {

        setIsSubmitingSale(true);
        if (!selectedClient || orderItems.length === 0) return;

        const saleData: CreateSaleDTO = {
            clientId: selectedClient.id,
            paymentMethod: selectedPayment,
            items: orderItems.map<CreateSaleItemDTO>(item => ({
                productId: item.item.id,
                soldQuantity: item.sold,
                returnedQuantity: item.returned,
                negotiatedPrice: item.negotiatedPrice,
                negotiatedCylinderPrice: item.negotiatedCylinderPrice
            }))
        };

        try {
            const response = await createSale(saleData);
            setIsSubmitingSale(false)
            navigate(`/sale-detail/${response.saleId}`);
        } catch (error) {
            console.error("Erro ao registrar venda:", error);
            alert("Erro ao registrar venda");
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-4 pb-10 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className="space-y-6">
                    {/* Seção Principal */}
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <h2 className="text-md font-semibold">Informação principal</h2>
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
                            </div>
                        </div>
                    </div>

                    {/* Seção de Pedido */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-semibold">Informação venta</h2>
                            <Button size="sm" onClick={openAddItemModal}>
                                <Plus className="w-4 h-4 mr-2" />
                                Agregar Item
                            </Button>
                        </div>

                        {orderItems.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No hay items agregados
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 border border-gray-100 rounded-lg">
                                {orderItems.map((orderItem, index) => (
                                    <div key={index} className="py-2 px-3 hover:bg-gray-50 group">
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="font-medium text-sm min-w-[80px]">
                                                    {orderItem.item.name}
                                                </span>
                                                {(orderItem.negotiatedPrice || orderItem.negotiatedCylinderPrice) && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
                                                        Personalizado
                                                    </span>
                                                )}
                                            </div>

                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1 text-green-600">
                                                    <ArrowUpCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium text-gray-700">{orderItem.sold}</span>
                                                </div>
                                                <div className="flex items-center gap-1 text-red-600">
                                                    <ArrowDownCircle className="w-4 h-4" />
                                                    <span className="text-sm font-medium text-gray-700">{orderItem.returned}</span>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium min-w-[70px] text-right">
                                                    ${(
                                                        (orderItem.negotiatedPrice || orderItem.item.basePrice) * orderItem.sold -
                                                        orderItem.returned * (orderItem.negotiatedCylinderPrice || orderItem.item.emptyCylinderPrice)
                                                    ).toFixed(2)}
                                                </span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="text-destructive"
                                                    onClick={() => removeItem(index)}
                                                >
                                                    <X className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {orderItems.length > 0 && (
                            <div className="text-md font-semibold text-right">
                                Total: ${calculateTotal().toFixed(2)}
                            </div>
                        )}
                    </div>

                    {/* Seção de Pagamento */}
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Medio de pago</h2>
                        <RadioGroup
                            value={selectedPayment}
                            onValueChange={(value) => setSelectedPayment(value as 'CASH' | 'YAPE')}
                            className="flex flex-col md:flex-row gap-2"
                        >
                            <label
                                htmlFor="CASH"
                                className={`flex items-center space-x-3 border p-3 rounded-xl flex-1 cursor-pointer ${selectedPayment === 'CASH' ? 'border-primary bg-primary/5' : ''}`}
                            >
                                <RadioGroupItem value="CASH" id="CASH" className="sr-only" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'CASH' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                    {selectedPayment === 'CASH' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <img src={MoneySVG} alt="CASH" className="h-4 w-4" />
                                <span className='font-normal'>Efectivo</span>
                            </label>

                            <label
                                htmlFor="YAPE"
                                className={`flex items-center space-x-3 border p-3 rounded-xl flex-1 cursor-pointer ${selectedPayment === 'YAPE' ? 'border-primary bg-primary/5' : ''}`}
                            >
                                <RadioGroupItem value="YAPE" id="YAPE" className="sr-only" />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'YAPE' ? 'border-primary bg-primary' : 'border-gray-300'}`}>
                                    {selectedPayment === 'YAPE' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <img src={SmartPhoneSVG} alt="Yape" className="h-4 w-4" />
                                <span className='font-normal'>Yape</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <Button
                        className="w-full"
                        onClick={handleSubmitSale}
                        disabled={!orderItems.length || !selectedClient}
                    >
                        {isSubmitingSale && (
                            <Loader2 className='h-6 w-6 animate-spin text-white' />
                        )}
                        Registrar Venta
                    </Button>
                </div>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center z-50">
                    <div className="w-full max-w-md bg-background rounded-t-2xl md:rounded-xl p-6 animate-in slide-in-from-bottom md:zoom-in-95">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-semibold">Agregar Item</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setIsModalOpen(false)}
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label>Producto</Label>
                                <Select
                                    value={tempItem.itemId || ""}
                                    onValueChange={value => {
                                        setTempItem(prev => ({
                                            ...prev,
                                            itemId: value,
                                            negotiatedPrice: undefined,
                                            negotiatedCylinderPrice: undefined
                                        }));
                                    }}
                                    disabled={isLoadingProducts}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Seleccionar producto" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map(product => (
                                            <SelectItem key={product.id} value={product.id}>
                                                {product.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            {tempItem.itemId && (
                                <div className="flex flex-col gap-4">

                                    <div className='grid grid-cols-2 gap-2'>

                                        <div className="space-y-2">
                                            <Label>Vendidos</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={tempItem.sold ?? ''}
                                                onChange={(e) => handleInputChange(e, 'sold')}
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label>Devueltos</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                step="1"
                                                value={tempItem.returned ?? ''}
                                                onChange={(e) => handleInputChange(e, 'returned')}
                                            />
                                        </div>

                                    </div>
                                    {(() => {
                                        const selectedProduct = products.find(p => p.id === tempItem.itemId)!;
                                        return (
                                            <>
                                                <div className='grid grid-cols-2 gap-2'>

                                                    <div className="space-y-2">
                                                        <Label>Precio Unitario (S/)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                tempItem.negotiatedPrice !== undefined
                                                                    ? tempItem.negotiatedPrice
                                                                    : selectedProduct.basePrice
                                                            }
                                                            onChange={(e) => handleInputChange(e, 'negotiatedPrice')}
                                                            disabled={!selectedProduct.allowPriceNegotiation}
                                                        />
                                                    </div>

                                                    <div className="space-y-2">
                                                        <Label>Precio Cilindro (S/)</Label>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            value={
                                                                tempItem.negotiatedCylinderPrice !== undefined
                                                                    ? tempItem.negotiatedCylinderPrice
                                                                    : selectedProduct.emptyCylinderPrice
                                                            }
                                                            onChange={(e) => handleInputChange(e, 'negotiatedCylinderPrice')}
                                                            disabled={!selectedProduct.allowCylinderNegotiation}
                                                        />
                                                    </div>
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            )}

                            <Button
                                className="w-full mt-4"
                                onClick={addItemToOrder}
                                disabled={!tempItem.itemId || (tempItem.sold === 0 && tempItem.returned === 0)}
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