import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Input } from '../components/ui/input';
import { Plus } from 'lucide-react';
import { BottomNav } from '../components/bottom-nav';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';

interface Driver {
    id: string;
    name: string;
    license: string;
    avatar: string;
    status: 'Active' | 'Inactive';
}

export function DriversListPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTab, setSelectedTab] = useState<'all' | 'active' | 'inactive'>('all');

    const drivers: Driver[] = [
        { id: '1', name: 'John Cooper', license: 'ABC123456', avatar: 'https://i.pravatar.cc/300', status: 'Active' },
        { id: '2', name: 'Sarah Wilson', license: 'XYZ789012', avatar: 'https://i.pravatar.cc/300', status: 'Active' },
        { id: '3', name: 'Mike Johnson', license: 'DEF345678', avatar: 'https://i.pravatar.cc/300', status: 'Inactive' },
    ];

    // Filtrar por búsqueda y status
    const filteredDrivers = drivers.filter(driver => {
        const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTab =
            selectedTab === 'all' ||
            (selectedTab === 'active' && driver.status === 'Active') ||
            (selectedTab === 'inactive' && driver.status === 'Inactive');
        return matchesSearch && matchesTab;
    });

    return (
        <div className="flex flex-col min-h-screen bg-gray-50">
            <div className="px-6 pt-6 pb-4 max-w-md mx-auto w-full">
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Choferes</h1>
                    <Button className=' flex' size='sm' onClick={() => navigate('/register-driver')}>
                        <Plus />
                        Nuevo
                    </Button>
                </div>
                <div className="mt-4">
                    <Input
                        placeholder="Buscar usuario"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Tabs */}
                <div className="flex space-x-2 mt-4">
                    <Button
                        size='sm'
                        onClick={() => setSelectedTab('all')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${selectedTab === 'all'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        Todos
                    </Button>
                    <Button
                        size='sm'
                        onClick={() => setSelectedTab('active')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${selectedTab === 'active'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        Activos
                    </Button>
                    <Button
                        size='sm'
                        onClick={() => setSelectedTab('inactive')}
                        className={`px-4 py-2 rounded-full text-sm font-medium ${selectedTab === 'inactive'
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 text-gray-700'
                            }`}
                    >
                        Inactivos
                    </Button>
                </div>

                {/* Driver List */}
                <div className="mt-4 space-y-3">
                    {filteredDrivers.map(driver => (
                        <Card
                            key={driver.id}
                        >
                            <CardContent className='flex items-center justify-between'>

                                <div className="flex items-center space-x-3">
                                    <img
                                        src={driver.avatar}
                                        alt={driver.name}
                                        className="w-10 h-10 rounded-full"
                                    />
                                    <div>
                                        <p className="font-medium">{driver.name}</p>
                                        <p className="text-sm text-gray-500">License: {driver.license}</p>
                                    </div>
                                </div>
                                <span
                                    className={`px-2 py-1 text-xs font-medium rounded-full ${driver.status === 'Active'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}
                                >
                                    {driver.status}
                                </span>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>

            <BottomNav />
        </div>
    );
}
