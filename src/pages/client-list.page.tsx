import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Plus, Trash2 } from 'lucide-react';
import { ClientDTO } from '../dtos/client.dto';
import { Card, CardContent } from '../components/ui/card';

export function ClientListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const mockClients: ClientDTO[] = [
        {
            id: '1',
            name: 'Juan Valdez',
            dni: '70123456',
            phone: '999888777',
            email: 'juan@email.com',
            address: 'Av. Principal 123',
            createdAt: new Date(),
            updatedAt: new Date(),
        },
        {
            id: '2',
            name: 'Jenifer',
            dni: '20654328765',
            phone: '011234567',
            email: 'contacto@empresa.com',
            address: 'Calle 1',
            createdAt: new Date(),
            updatedAt: new Date(),
        }
    ];

    const filtered = mockClients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.dni.includes(search)
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const handleDelete = (_id: string) => {
        if (window.confirm('¿Seguro que deseas eliminar este cliente?')) {
            // Lógica para eliminar
        }
    };

    return (
        <div className="flex px-4 flex-col min-h-screen ">
            <Header title="Clientes" />
            <div className="pt-4 pb-4 max-w-3xl mx-auto w-full">
                <div className="flex items-center  justify-between gap-2">


                    <div className=" flex flex-1 relative">
                        <Input
                            placeholder="Buscar clientes..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => navigate('/clients/new')}
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Nuevo
                    </Button>
                </div>



                <div className="mt-4 space-y-2">
                    {filtered.map(client => (
                        <Card
                            key={client.id}
                            className="cursor-pointer"
                            onClick={() => navigate(`/clients/${client.id}`)}
                        >
                            <CardContent className="flex justify-between items-start">
                                <div className="flex-1">
                                    <h3 className="font-medium">{client.name}</h3>
                                    <div className="mt-2 text-sm space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">DNI/RUC:</span>
                                            <span>{client.dni}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-gray-500">Teléfono:</span>
                                            <span>{client.phone}</span>
                                        </div>
                                        {client.email && (
                                            <div className="flex items-center gap-2">
                                                <span className="text-gray-500">Email:</span>
                                                <span className="text-blue-600">{client.email}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="flex gap-1 ml-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 text-gray-500"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(client.id!);
                                        }}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}