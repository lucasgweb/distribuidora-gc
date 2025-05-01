import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { ClientDTO } from '../dtos/client.dto';
import { createClient, getClient, updateClient } from '../services/clients.service';
import { FullScreenLoader } from '../components/full-screen-loader';

// Función para formatear número de teléfono para Perú (+51)
function formatPhoneNumber(value: string): string {
    let cleaned = value.replace(/\D/g, '');

    // Manejar números que ya empiezan con 51
    if (cleaned.startsWith('51')) {
        cleaned = cleaned.substring(0, 11); // Limitar a 11 dígitos (51 + 9)
    } else {
        cleaned = '51' + cleaned;
        cleaned = cleaned.substring(0, 11); // Limitar a 11 dígitos (51 + 9)
    }

    if (cleaned.length === 0) return '';

    const countryCode = cleaned.substring(0, 2);
    const rest = cleaned.substring(2);

    let formatted = `+${countryCode}`;

    if (rest.length > 0) {
        formatted += ' ';
        for (let i = 0; i < rest.length; i += 3) {
            const part = rest.substring(i, i + 3);
            formatted += part;
            if (i + 3 < rest.length) {
                formatted += ' ';
            }
        }
    }

    return formatted;
}

// Validación de DNI peruano (8 dígitos)
function isValidDNI(dni: string): boolean {
    return /^\d{8}$/.test(dni);
}

// Validación de RUC peruano (11 dígitos y comienza con 10 o 20)
function isValidRUC(ruc: string): boolean {
    return /^(10|20)\d{9}$/.test(ruc);
}

// Validación combinada DNI/RUC
function isValidDNIorRUC(value: string): boolean {
    return isValidDNI(value) || isValidRUC(value);
}

export function ClientFormPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const [client, setClient] = useState<ClientDTO>({
        id: '',
        name: '',
        document: '',
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
                    setClient({
                        ...data,
                        phone: formatPhoneNumber(data.phone),
                    });
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

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};


        if (client.document) {

            // Validar DNI/RUC
            if (!isValidDNIorRUC(client.document)) {
                newErrors.dni = 'Ingrese un DNI válido (8 dígitos) o RUC válido (11 dígitos)';
            }
        }

        // Validar teléfono peruano (+51)
        const phoneDigits = client.phone.replace(/\D/g, '');
        if (phoneDigits.length > 0) {
            const isPhoneValid = phoneDigits.startsWith('51') && phoneDigits.length === 11;
            if (!isPhoneValid) {
                newErrors.phone = 'Número inválido. Formato requerido: +51 987 654 321';
            }
        } else {
            newErrors.phone = 'El número de teléfono es requerido';
        }

        // Validar email
        if (client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email)) {
            newErrors.email = 'Ingrese un email válido';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            // Limpiar formato del teléfono antes de guardar
            const cleanedPhone = client.phone.replace(/\s/g, '');

            if (id && id !== 'new') {
                await updateClient({
                    ...client,
                    phone: cleanedPhone,
                });
            } else {
                await createClient({
                    ...client,
                    phone: cleanedPhone,
                });
            }

            navigate('/clients');
        } catch (error) {
            console.error('Error saving client:', error);
            alert('Ocurrió un error al guardar el cliente.');
        }
    };

    const handleDNIChange = (value: string) => {
        const onlyNums = value.replace(/\D/g, '');
        setClient({ ...client, document: onlyNums });
        if (isValidDNIorRUC(onlyNums)) {
            setErrors({ ...errors, dni: '' });
        }
    };

    const handlePhoneChange = (value: string) => {
        const formatted = formatPhoneNumber(value);
        setClient({ ...client, phone: formatted });

        // Validación en tiempo real
        const phoneDigits = formatted.replace(/\D/g, '');
        if (phoneDigits.startsWith('51') && phoneDigits.length === 11) {
            setErrors({ ...errors, phone: '' });
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
                                <Label>Nombre Completo<span className='text-red-500'>*</span></Label>
                                <Input
                                    required
                                    value={client.name}
                                    onChange={e => setClient({ ...client, name: e.target.value })}
                                />
                            </div>

                            <div className="grid gap-4">
                                <div>
                                    <Label>DNI/RUC</Label>
                                    <Input
                                        value={client.document}
                                        onChange={e => handleDNIChange(e.target.value)}
                                        placeholder="DNI (8 dígitos) o RUC (11 dígitos)"
                                        maxLength={11}
                                    />
                                    {errors.dni && <p className="text-red-500 text-sm mt-1">{errors.dni}</p>}
                                </div>
                                <div>
                                    <Label>Teléfono<span className='text-red-500'>*</span></Label>
                                    <Input
                                        required
                                        value={client.phone}
                                        onChange={e => handlePhoneChange(e.target.value)}
                                        placeholder="+51 987 654 321"
                                    />
                                    {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
                                </div>
                                <div>
                                    <Label>Email</Label>
                                    <Input
                                        type="email"
                                        value={client.email || ''}
                                        onChange={e => setClient({ ...client, email: e.target.value })}
                                    />
                                    {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
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