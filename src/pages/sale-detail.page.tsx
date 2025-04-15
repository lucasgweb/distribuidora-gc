import { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { User, Package } from "lucide-react";
import {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectItem,
} from "../components/ui/select";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import MoneySVG from '../assets/money.svg';
import SmartPhoneSVG from '../assets/smartphone.svg';
import { ClientSearch } from '../components/client-search';
import { Client } from '../dtos/client.dto';
import { BottomNav } from '../components/bottom-nav';


export function SaleDetailPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState("");
    const [clients, setClients] = useState<Client[]>([]);
    const [selectedClient, setSelectedClient] = useState<Client | null>(null);
    const [isLoading, setIsLoading] = useState(false);



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
            console.error("Erro na busca de clientes:", error);
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
            <div className="px-6 pb-24 max-w-2xl mx-auto w-full flex-1">
                <Header title="Registrar Venta" onBack={() => navigate('/')} />

                <div className=" space-y-6">
                    {/* Seção Principal */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Información principal</h2>

                        <div className="space-y-4">
                            <div className="grid md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Chofer</Label>
                                    <Select>
                                        <SelectTrigger className='w-full'>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 opacity-50" />
                                                <SelectValue placeholder="Seleccionar Chofer" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Chofer 1</SelectItem>
                                            <SelectItem value="2">Chofer 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>Marca</Label>
                                    <Select>
                                        <SelectTrigger className='w-full'>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 opacity-50" />
                                                <SelectValue placeholder="Seleccionar marca" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="m1">Marca 1</SelectItem>
                                            <SelectItem value="m2">Marca 2</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2 w-full relative">
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

                    {/* Informação de Venda */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Información venta</h2>

                        <div className="space-y-2">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Pipeta</Label>
                                    <Select defaultValue="1">
                                        <SelectTrigger className='w-full'>
                                            <SelectValue placeholder="Estado da pipeta" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="1">Llena</SelectItem>
                                            <SelectItem value="2">Vacia</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">

                                    <div className='space-y-2'>

                                        <Label>
                                            Kilos Vendidos
                                        </Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            step="0.01"
                                        />
                                    </div>
                                    <div className='space-y-2'>

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

                    {/* Meio de Pagamento */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium">Medio de pago</h2>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex items-center space-x-3 border p-5 rounded-md flex-1">
                                <Checkbox id="efectivo" defaultChecked />
                                <img src={MoneySVG} alt="Efectivo" className="h-4 w-4" />
                                <Label className='font-normal' htmlFor="efectivo">Efectivo</Label>
                            </div>
                            <div className="flex items-center space-x-3 border p-5 rounded-md flex-1">
                                <Checkbox id="yape" />
                                <img src={SmartPhoneSVG} alt="Yape" className="h-4 w-4" />
                                <Label className='font-normal' htmlFor="yape">Yape</Label>
                            </div>
                        </div>
                    </div>
                </div>

                <Button className="w-full mt-4">
                    Registrar Venta
                </Button>
            </div>


            <BottomNav />
        </div>
    );
}