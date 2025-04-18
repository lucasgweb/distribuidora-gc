import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';

interface InventoryItem {
    id: string;
    balon: string;
    marca: string;
    pipeta: string;
    cantidad: number;
    fecha: string;
}

export function InventoryListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const mockData: InventoryItem[] = [
        { id: '1', balon: '10 kilos', marca: 'DELTA', pipeta: 'Llena', cantidad: 50, fecha: '2025-04-15' },
        { id: '2', balon: '15 kilos', marca: 'SOL', pipeta: 'Vacía', cantidad: 30, fecha: '2025-04-14' },
        { id: '3', balon: '45 kilos', marca: 'AIRE', pipeta: 'Llena', cantidad: 20, fecha: '2025-04-13' },
    ];

    const filtered = mockData.filter(item =>
        item.balon.toLowerCase().includes(search.toLowerCase()) ||
        item.marca.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="px-6 pt-6 pb-4 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between">
                    <Header title="Inventario" />
                    <Button variant="ghost" onClick={() => navigate('/inventory-movement')}>
                        +
                    </Button>
                </div>

                <div className="mt-4">
                    <Input
                        placeholder="Buscar inventario"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>

                <div className="mt-4 space-y-3">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white p-4 rounded-xl shadow flex justify-between">
                            <div>
                                <p className="font-medium">{item.balon} - {item.marca}</p>
                                <p className="text-sm text-gray-500">Pipeta: {item.pipeta} • Cantidad: {item.cantidad}</p>
                                <p className="text-xs text-gray-400">{item.fecha}</p>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => navigate(`/inventory-detail/${item.id}`)}>
                                Ver
                            </Button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

