import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import LogoIcon from "../assets/logo-icon.png";
import { Eye, EyeClosed } from "lucide-react";

export function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="flex items-center flex-col justify-center h-screen px-8 bg-gray-100 relative overflow-hidden">
            <div className="absolute -right-[150px] -top-[200px] w-[520px] h-[520px] rounded-full bg-primary/5" />

            <img src={LogoIcon} alt="Logo" className="w-20 h-20 mx-auto mb-4 z-10" />
            <h1 className="text-3xl font-bold mb-4 text-primary z-10">Iniciar sesión</h1>
            <p className="text-gray-600 mb-4 mt-4 text-xl font-medium text-center tracking-tight leading-tight z-10">
                ¡Bienvenido de nuevo,<br />
                te hemos extrañado!
            </p>
            <form className="w-full mt-4 z-10" action="/login" method="POST">
                <div className="mb-4 w-full">
                    <Input type="text" className="w-full" id="username" placeholder="Correo electrónico" />
                </div>
                <div className="mb-4 relative">
                    <Input
                        type={showPassword ? "text" : "password"}
                        className="w-full pr-10"
                        id="password"
                        placeholder="Contraseña"
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
                <div className="flex items-center justify-end mb-4">
                    <a href="#" className="text-sm text-primary font-medium hover:underline">
                        ¿Olvidaste tu contraseña?
                    </a>
                </div>
                <Button className="w-full" type="submit">
                    Iniciar sesión
                </Button>
                <Button className="w-full mt-4 text-gray-900" variant="link" type="button">
                    Crear nueva cuenta
                </Button>
            </form>
        </div>
    );
}