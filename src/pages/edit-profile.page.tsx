import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Eye, EyeClosed, X } from "lucide-react";
import { toast } from "sonner";
import { api } from "../lib/api";

export function EditProfilePage() {
    const { userId } = useParams<{ userId: string }>();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await api.get(`/users/${userId}`);
                setFormData({
                    name: response.data.name,
                    email: response.data.email,
                    password: '' // Password não é retornado pela API
                });
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
            } catch (error) {
                setError('Error al cargar el usuario');
                toast.error('No se pudo cargar la información del usuario');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUser();
        }
    }, [userId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            await api.patch(`/users/${userId}`, {
                name: formData.name,
                password: formData.password || undefined // Só atualiza se houver mudança
            });

            toast.success("Perfil actualizado correctamente");
            navigate(-1);
        } catch (error) {
            toast.error("Error al actualizar el perfil");
            console.error('Update error:', error);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
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
            <header className="flex items-center justify-between py-4 bg-white rounded-lg mb-6 px-4 shadow-sm">
                <h1 className="text-xl font-semibold">Editar perfil</h1>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate(-1)}
                >
                    <X className="w-5 h-5" />
                </Button>
            </header>

            <form onSubmit={handleSubmit} className="bg-white rounded-lg p-6 shadow-sm space-y-6">
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