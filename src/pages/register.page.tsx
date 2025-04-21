/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import LogoIcon from "../assets/logo-icon.png";
import { Eye, EyeClosed } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { registerService } from "../services/register.service";

export function RegisterPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [code, setCode] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        if (code.length !== 5) {
            toast.error("El código debe tener 5 dígitos");
            setLoading(false);
            return;
        }

        try {
            await registerService({
                code,
                email,
                name,
                password
            })

            toast.success("¡Registro exitoso!");
            navigate("/login");
        } catch (error: any) {
            toast.error(error.message || "Error al registrar usuario");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center flex-col justify-center h-screen px-8 bg-gray-100 relative overflow-hidden">
            <div className="fixed -right-[70%] -top-[40%] w-[80vh] h-[80vh] rounded-full bg-primary/5 z-0" />

            <img src={LogoIcon} alt="Logo" className="w-20 h-20 mx-auto mb-4 z-10" />
            <h1 className="text-3xl font-bold mb-4 text-primary z-10">Crear cuenta</h1>
            <p className="text-gray-600 mb-4 mt-4 text-xl font-medium text-center tracking-tight leading-tight z-10">
                ¡Bienvenido!<br />
                Comienza tu experiencia
            </p>

            <form className="w-full mt-4 z-10 max-w-md" onSubmit={handleSubmit}>
                <div className="space-y-4">
                    <Input
                        type="text"
                        placeholder="Nombre completo"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />

                    <Input
                        type="email"
                        placeholder="Correo electrónico"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <div className="relative">
                        <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Contraseña"
                            className="pr-10"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            minLength={6}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-4 h-5 w-5 text-gray-500 hover:text-gray-700"
                        >
                            {showPassword ? (
                                <Eye className="w-5 h-5" />
                            ) : (
                                <EyeClosed className="w-5 h-5" />
                            )}
                        </button>
                    </div>

                    <Input
                        type="number"
                        placeholder="Código de invitación"
                        value={code}
                        onChange={(e) => setCode(e.target.value.slice(0, 5))}
                        required
                        minLength={5}
                        maxLength={5}
                    />
                </div>

                <Button
                    className="w-full mt-8"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? (
                        <span className="animate-pulse">Procesando...</span>
                    ) : (
                        "Registrarse"
                    )}
                </Button>

                <Button
                    className="w-full mt-6 text-gray-900"
                    variant="link"
                    type="button"
                    onClick={() => navigate("/login")}
                >
                    ¿Ya tienes cuenta? Inicia sesión
                </Button>
            </form>
        </div>
    );
}