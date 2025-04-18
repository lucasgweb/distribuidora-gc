import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { ClientDTO } from '../dtos/client.dto';

export function ClientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [client, setClient] = useState<ClientDTO>({
        id: '',
        name: '',
        dni: '',
        phone: '',
        email: '',
        address: '',
        createdAt: new Date(),
        updatedAt: new Date(),
    });

    useEffect(() => {
        if (id && id !== 'new') {
            // Fetch client data
            const mockClient = {
                id: '1',
                name: 'Juan Pérez',
                dni: '70123456',
                phone: '999888777',
                email: 'juan@email.com',
                address: 'Av. Principal 123',
                createdAt: new Date(),
                updatedAt: new Date(),
            };
            setClient(mockClient);
        }
    }, [id]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Save logic
        navigate('/clients');
    };

    return (
        <div className="flex px-6 flex-col min-h-screen">
            <Header
                title={id ? "Editar Cliente" : "Nuevo Cliente"}
                onBack={() => navigate('/clients')}
            />
            <div className="pt-4 pb-4 max-w-2xl mx-auto w-full">

                <form onSubmit={handleSubmit} >
                    <div className="space-y-4">
                        <div className="grid gap-4">
                            <div>
                                <Label>Nombre Completo/Razón Social</Label>
                                <Input
                                    required
                                    value={client.name}
                                    onChange={e => setClient({ ...client, name: e.target.value })}
                                />
                            </div>

                            <div className="grid  gap-4">
                                <div>
                                    <Label>Teléfono</Label>
                                    <Input
                                        required
                                        value={client.phone}
                                        onChange={e => setClient({ ...client, phone: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={client.email || ''}
                                        onChange={e => setClient({ ...client, email: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <Label>Dirección</Label>
                                <Input
                                    value={client.address || ''}
                                    onChange={e => setClient({ ...client, address: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex gap-2 mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                className="flex-1"
                                onClick={() => navigate('/clients')}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" className="flex-1">
                                {id ? 'Guardar Cambios' : 'Crear Cliente'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}