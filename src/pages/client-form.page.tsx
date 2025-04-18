import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { ClientDTO } from '../dtos/client.dto';
import { createClient, getClient, updateClient } from '../services/clients.service';
import { FullScreenLoader } from '../components/full-screen-loader';

export function ClientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

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
        async function loadClient() {
            if (id && id !== 'new') {
                try {
                    const data = await getClient(id);
                    setClient(data);
                } catch (error) {
                    console.error('Error loading client:', error);
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        }

        loadClient();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            if (id && id !== 'new') {
                await updateClient({
                    id: client.id,
                    name: client.name,
                    dni: client.dni,
                    phone: client.phone,
                    email: client.email,
                    address: client.address,
                });
            } else {
                await createClient({
                    name: client.name,
                    dni: client.dni,
                    phone: client.phone,
                    email: client.email,
                    address: client.address,
                });
            }

            navigate('/clients');
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Ocorreu um erro ao salvar o cliente.');
        }
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    return (
        <div className="flex px-6 flex-col min-h-screen">
            <Header
                title={id && id !== 'new' ? 'Editar Cliente' : 'Nuevo Cliente'}
                onBack={() => navigate('/clients')}
            />

            <div className="pt-4 pb-4 max-w-2xl mx-auto w-full">
                <form onSubmit={handleSubmit}>
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

                            <div className="grid gap-4">
                                <div>
                                    <Label>DNI</Label>
                                    <Input
                                        required
                                        value={client.dni}
                                        onChange={e => setClient({ ...client, dni: e.target.value })}
                                    />
                                </div>
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
                                {id && id !== 'new' ? 'Guardar Cambios' : 'Crear Cliente'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
