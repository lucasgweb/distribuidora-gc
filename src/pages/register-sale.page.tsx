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

export function RegisterSalePage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedPayment, setSelectedPayment] = useState<'efectivo' | 'yape' | null>('efectivo');

    const searchClients = async (query: string) => {
        try {
            setIsLoading(true);
            await new Promise(resolve => setTimeout(resolve, 1000));
            const mockData: Client[] = [
                { id: '1', name: 'Cliente A', email: 'clientea@email.com', phone: '' },
                { id: '2', name: 'Cliente B', phone: '(11) 99999-9999', email: '' },
                { id: '3', name: 'Cliente C', email: 'clientec@email.com', phone: '' },
            ];
            setClients(
                mockData.filter(client =>
                    client.name.toLowerCase().includes(query.toLowerCase())
                )
            );
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

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-6 pb-10 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className="space-y-4">
                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Información principal</h2>

                        <div className="space-y-3">
                            <div className="grid md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label>Conductor</Label>
                                    <Select>
                                        <SelectTrigger className='w-full'>
                                            <div className="flex items-center gap-2">
                                                <SelectValue placeholder="Seleccionar conductor" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Conductor 1</SelectItem>
                                            <SelectItem value="2">Conductor 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1">
                                    <Label>Marca</Label>
                                    <Select>
                                        <SelectTrigger className='w-full'>
                                            <div className="flex items-center gap-2">
                                                <SelectValue placeholder="Seleccionar marca" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="m1">DELTA 5</SelectItem>
                                            <SelectItem value="m2">DELTA 10</SelectItem>
                                            <SelectItem value="m3">DELTA 45</SelectItem>
                                            <SelectItem value="m4">SOL 45</SelectItem>
                                            <SelectItem value="m5">DELTA 10</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-1 w-full relative">
                                <Label>Cliente</Label>
                                <ClientSearch
                                    clients={clients}
                                    selectedClient={selectedClient || undefined}
                                    onSelect={(client) => setSelectedClient(client)}
                                    searchQuery={searchQuery}
                                    setSearchQuery={setSearchQuery}
                                    isLoading={isLoading}

                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h2 className="text-md font-semibold">Información de venta</h2>
                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div className="space-y-1">
                                    <Label>Balón de gas</Label>
                                    <Select defaultValue="1">
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Estado de la pipeta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Llena</SelectItem>
                                            <SelectItem value="2">Vacía</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <div className='space-y-1'>
                                        <Label>Kilos vendidos</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className='space-y-1'>
                                        <Label>Precio</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
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
                </div>

                <Button className="w-full mt-4" onClick={() => navigate('/sale-detail')}>
                    Registrar Venta
                </Button>
            </div>
        </div>
    );
}