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
import { Client } from '../dtos/client.dto';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { X, Plus, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface Item {
    id: number;
    name: string;
    price_full: number;
    deposit: number;
}

interface OrderItem {
    item: Item;
    sold: number;
    returned: number;
    customPrice?: number;
}

const initialItems: Item[] = [
    { id: 1, name: 'DELTA 5', price_full: 150, deposit: 100 },
    { id: 2, name: 'DELTA 10', price_full: 200, deposit: 120 },
    { id: 3, name: 'SOL 45', price_full: 250, deposit: 150 },
];

export function RegisterSalePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'efectivo' | 'yape'>('efectivo');
    const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [tempItem, setTempItem] = useState<{
        itemId: number | null;
        sold: number;
        returned: number;
        customPrice: number | null;
    }>({ itemId: null, sold: 0, returned: 0, customPrice: null });

    const searchClients = async (query: string) => {
        try {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData: Client[] = [
                { id: '1', name: 'Cliente A', email: 'clientea@email.com', phone: '' },
                { id: '2', name: 'Cliente B', phone: '(11) 99999-9999', email: '' },
                { id: '3', name: 'Cliente C', email: 'clientec@email.com', phone: '' },
            ];
            setClients(mockData.filter(client =>
                client.name.toLowerCase().includes(query.toLowerCase())
            ));
        } catch (error) {
            console.error("Error en la búsqueda de clientes:", error);
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        if (tempItem.itemId) {
            const selectedItem = initialItems.find(item => item.id === tempItem.itemId);
            if (selectedItem && tempItem.customPrice === null) {
                setTempItem(prev => ({
                    ...prev,
                    customPrice: selectedItem.price_full
                }));
            }
        }
    }, [tempItem.itemId]);

    const openAddItemModal = () => {
        setTempItem({ itemId: null, sold: 0, returned: 0, customPrice: null });
        setIsModalOpen(true);
    };

    const addItemToOrder = () => {
        if (tempItem.itemId && (tempItem.sold > 0 || tempItem.returned > 0)) {
            const selectedItem = initialItems.find(item => item.id === tempItem.itemId);
            if (selectedItem) {
                const newItem: OrderItem = {
                    item: selectedItem,
                    sold: tempItem.sold,
                    returned: tempItem.returned,
                    customPrice: tempItem.customPrice !== null && tempItem.customPrice !== selectedItem.price_full ? tempItem.customPrice : undefined
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
        return orderItems.reduce((total, { sold, returned, item, customPrice }) => {
            const actualPrice = customPrice !== undefined ? customPrice : item.price_full;
            return total + (sold * actualPrice - returned * item.deposit);
        }, 0);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'sold' | 'returned' | 'customPrice') => {
        const value = e.target.value;
        if (value === '') {
            setTempItem(prev => ({ ...prev, [field]: field === 'customPrice' ? null : 0 }));
        } else {
            const numValue = parseFloat(value);
            if (!isNaN(numValue)) {
                setTempItem(prev => ({ ...prev, [field]: numValue >= 0 ? numValue : 0 }));
            }
        }
    };

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-4 pb-10 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className="space-y-6">
                    {/* Sección Principal */}
                    <div className="space-y-4">
                        <div className="grid gap-4">

                            <h2 className="text-md font-semibold">Información principal</h2>
                            <div className="space-y-2">
                                <Label>Cliente</Label>
                                <ClientSearch
                                    clients={clients}
                                    selectedClient={selectedClient || undefined}
                                    onSelect={setSelectedClient}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    isLoading={isLoading}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de Pedido */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-md font-semibold">Información venta</h2>
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
                                            {/* Left Section */}
                                            <div className="flex items-center gap-3 flex-1">
                                                <span className="font-medium text-sm min-w-[80px]">
                                                    {orderItem.item.name}
                                                </span>

                                                {orderItem.customPrice && (
                                                    <span className="text-xs px-1.5 py-0.5 bg-amber-50 text-amber-700 rounded">
                                                        Personalizado
                                                    </span>
                                                )}
                                            </div>

                                            {/* Middle Section */}
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

                                            {/* Right Section */}
                                            <div className="flex items-center gap-3">
                                                <span className="text-sm font-medium min-w-[70px] text-right">
                                                    ${(
                                                        (orderItem.customPrice ?? orderItem.item.price_full) * orderItem.sold -
                                                        orderItem.returned * orderItem.item.deposit
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

                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Medio de pago</h2>
                        <RadioGroup
                            value={selectedPayment || ""}
                            onValueChange={(value: string) => setSelectedPayment(value as 'efectivo' | 'yape')}
                            className="flex flex-col md:flex-row gap-2"
                        >
                            {/* Opción Efectivo */}
                            <label // Cambiado de div a label para mejor accesibilidad
                                htmlFor="efectivo"
                                className={`flex items-center space-x-3 border p-3 rounded-xl flex-1 cursor-pointer ${selectedPayment === 'efectivo' ? 'border-primary bg-primary/5' : ''
                                    }`}
                            >
                                <RadioGroupItem
                                    value="efectivo"
                                    id="efectivo"
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'efectivo' ? 'border-primary bg-primary' : 'border-gray-300'
                                    }`}>
                                    {selectedPayment === 'efectivo' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <img src={MoneySVG} alt="Efectivo" className="h-4 w-4" />
                                <span className='font-normal'>Efectivo</span>
                            </label>

                            {/* Opción Yape */}
                            <label // Cambiado de div a label para mejor accesibilidad
                                htmlFor="yape"
                                className={`flex items-center space-x-3 border p-3 rounded-xl flex-1 cursor-pointer ${selectedPayment === 'yape' ? 'border-primary bg-primary/5' : ''
                                    }`}
                            >
                                <RadioGroupItem
                                    value="yape"
                                    id="yape"
                                    className="sr-only"
                                />
                                <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedPayment === 'yape' ? 'border-primary bg-primary' : 'border-gray-300'
                                    }`}>
                                    {selectedPayment === 'yape' && <div className="w-2 h-2 rounded-full bg-white" />}
                                </div>
                                <img src={SmartPhoneSVG} alt="Yape" className="h-4 w-4" />
                                <span className='font-normal'>Yape</span>
                            </label>
                        </RadioGroup>
                    </div>

                    <Button className="w-full" onClick={() => navigate('/sale-detail')} disabled={!orderItems.length}>
                        Registrar Venta
                    </Button>
                </div>
            </div>

            {/* Modal para agregar items */}
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
                                <Label>Marca</Label>
                                <Select
                                    value={tempItem.itemId?.toString() || ""}
                                    onValueChange={value => setTempItem(prev => ({
                                        ...prev,
                                        itemId: Number(value),
                                        customPrice: initialItems.find(item => item.id === Number(value))?.price_full || null
                                    }))}
                                >
                                    <SelectTrigger className='w-full'>
                                        <SelectValue placeholder="Seleccionar marca" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {initialItems.map(item => (
                                            <SelectItem key={item.id} value={item.id.toString()}>
                                                {item.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-4">
                                <div className="space-y-2">
                                    <Label>Vendidos</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={tempItem.sold === 0 && tempItem.sold.toString() === '0' ? '' : tempItem.sold}
                                        onChange={(e) => handleInputChange(e, 'sold')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Devueltos</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        value={tempItem.returned === 0 && tempItem.returned.toString() === '0' ? '' : tempItem.returned}
                                        onChange={(e) => handleInputChange(e, 'returned')}
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label>Precio</Label>
                                    <Input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={tempItem.customPrice === null ? '' : tempItem.customPrice}
                                        onChange={(e) => handleInputChange(e, 'customPrice')}
                                        disabled={!tempItem.itemId}
                                    />
                                </div>
                            </div>

                            <Button
                                className="w-full mt-4"
                                onClick={addItemToOrder}
                                disabled={!tempItem.itemId || (tempItem.sold === 0 && tempItem.returned === 0) || tempItem.customPrice === null}
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