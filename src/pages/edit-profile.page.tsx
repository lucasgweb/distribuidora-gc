/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useNavigation, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeClosed, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { FullScreenLoader } from "../components/full-screen-loader";
import { Header } from "../components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";

export function EditProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER' as 'ADMIN' | 'MEMBER',
        active: true
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${id}`);
                setFormData({
                    name: response.data.user.name,
                    email: response.data.user.email,
                    password: '',
                    role: response.data.user.role,
                    active: response.data.user.active
                });
            } catch (error) {
                setError('Error al cargar el usuario');
                toast.error('No se pudo cargar la información del usuario');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchUser();
        }
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // Actualizar datos básicos
            await api.patch(`/users/${id}`, {
                name: formData.name,
                password: formData.password || undefined,
                role: formData.role
            });

            // Actualizar estado activo/inactivo
            await api.patch(`/users/${id}/status`, {
                active: formData.active
            });

            toast.success("Perfil actualizado correctamente");
            navigate(-1);
        } catch (error) {
            toast.error("Error al actualizar el perfil");
            console.error('Update error:', error);
        }
    };

    if (loading) {
        return <FullScreenLoader />;
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="text-red-500 text-lg">{error}</div>
                <Button onClick={() => navigate(-1)}>Volver</Button>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen px-4 bg-gray-100">
            <Header title="Editar perfil" onBack={() => navigate(-1)} />

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-sm space-y-6">
                <div className="space-y-4">
                    <div>
                        <Label>Nombre completo</Label>
                        <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="Ingresa el nombre completo"
                            required
                        />
                    </div>

                    <div>
                        <Label>Correo electrónico</Label>
                        <Input
                            type="email"
                            value={formData.email}
                            disabled
                            className="opacity-70 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <Label>Nueva contraseña</Label>
                        <div className="relative">
                            <Input
                                type={showPassword ? "text" : "password"}
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                placeholder="Dejar en blanco para no cambiar"
                                minLength={8}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-500"
                            >
                                {showPassword ? <EyeClosed className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Rol del usuario</Label>
                        <Select
                            value={formData.role}
                            onValueChange={(value) => setFormData({ ...formData, role: value as 'ADMIN' | 'MEMBER' })}
                        >
                            <SelectTrigger className="w-[180px]">
                                <SelectValue placeholder="Seleccionar rol" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ADMIN">Administrador</SelectItem>
                                <SelectItem value="MEMBER">Miembro</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center justify-between">
                        <Label>Estado del usuario</Label>
                        <div className="flex items-center gap-2">
                            <Switch
                                checked={formData.active}
                                onCheckedChange={(checked: any) => setFormData({ ...formData, active: checked })}
                            />
                            <span className="text-sm">
                                {formData.active ? 'Activo' : 'Inactivo'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button type="button" variant="outline" className="flex-1" onClick={() => navigate(-1)}>
                        Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                        Guardar cambios
                    </Button>
                </div>
            </form>
        </div>
    );
}