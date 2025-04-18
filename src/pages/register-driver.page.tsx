import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { Eye, EyeClosed } from 'lucide-react';

export function RegisterDriverPage() {
    const navigate = useNavigate();

    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);

    const handleRegister = () => {
        // TODO: Implement registration logic
        navigate('/drivers');
    };

    return (
        <div className="flex flex-col min-h-screen bg-white">
            <div className="px-6 pb-10 max-w-md mx-auto w-full flex-1">
                <Header title="Registrar chofer" onBack={() => navigate(-1)} />

                <div className="mt-6 space-y-5">
                    <div className="space-y-1">
                        <Label htmlFor="fullName">Nombre completo</Label>
                        <Input
                            id="fullName"
                            placeholder="Ingresa el nombre completo"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="email">Correo electrónico</Label>
                        <Input
                            id="email"
                            type="email"
                            placeholder="ejemplo@email.pe"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            id="phone"
                            type="tel"
                            placeholder="(123) 456-7890"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1 relative">
                        <Label htmlFor="password">Contraseña</Label>
                        <Input
                            id="password"
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Mínimo 8 caracteres"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <button
                            type="button"
                            className="absolute top-9 right-3"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <Eye /> : <EyeClosed />}
                        </button>
                    </div>

                    <Button className="w-full mt-4" onClick={handleRegister}>
                        Registrar
                    </Button>
                </div>
            </div>
        </div>
    );
}
