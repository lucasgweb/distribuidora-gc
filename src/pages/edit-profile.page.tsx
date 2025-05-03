/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeClosed } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";
import { FullScreenLoader } from "../components/full-screen-loader";
import { Header } from "../components/header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Switch } from "../components/ui/switch";
import { useAuth } from "../hooks/use-auth.hook";
import { BottomNav } from "../components/bottom-nav";

type FormData = {
    name: string;
    email: string;
    password: string;
    role: 'ADMIN' | 'MEMBER';
    active: boolean;
};

export function EditProfilePage() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const isEditingSelf = user?.id === id;

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        password: '',
        role: 'MEMBER',
        active: true,
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
                    active: response.data.user.active,
                });
            } catch (err) {
                setError('Error al cargar el usuario');
                toast.error('No se pudo cargar la información del usuario');
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchUser();
    }, [id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await api.patch(`/users/${id}`, {
                name: formData.name,
                password: formData.password || undefined,
                ...(isEditingSelf ? {} : { role: formData.role }),
            });

            if (!isEditingSelf) {
                await api.patch(`/users/${id}/status`, { active: formData.active });
            }
            toast.success("Perfil actualizado correctamente");
            navigate(-1);
        } catch (err) {
            toast.error("Error al actualizar el perfil");
            console.error('Update error:', err);
        }
    };

    if (loading) return <FullScreenLoader />;
    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4">
                <div className="text-red-500 text-lg">{error}</div>
                <Button onClick={() => navigate(-1)}>Volver</Button>
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col h-screen max-w-6xl mx-auto px-4 ">
                <Header title="Editar perfil" onBack={() => navigate(-1)} />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <Label>Nombre completo</Label>
                            <Input
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
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
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={e => setFormData({ ...formData, password: e.target.value })}
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
                            {isEditingSelf ? (
                                <Input
                                    value={formData.role === 'ADMIN' ? 'Administrador' : 'Miembro'}
                                    disabled
                                    className="w-[180px] bg-gray-100 text-gray-600 cursor-not-allowed"
                                />
                            ) : (
                                <Select
                                    value={formData.role}
                                    onValueChange={value => setFormData({ ...formData, role: value as 'ADMIN' | 'MEMBER' })}
                                >
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Seleccionar rol" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="ADMIN">Administrador</SelectItem>
                                        <SelectItem value="MEMBER">Miembro</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        </div>

                        <div className="flex items-center justify-between">
                            <Label>Estado del usuario</Label>
                            <div className="flex items-center gap-2">
                                <Switch
                                    checked={formData.active}
                                    onCheckedChange={!isEditingSelf ? (checked: any) => setFormData({ ...formData, active: checked }) : undefined}
                                    disabled={isEditingSelf}
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
        </>
    );
}
