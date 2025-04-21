import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Button } from '../components/ui/button';
import { Loader2, Copy, Clock } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { generateInviteCode } from '../services/invite-codes.service';
import { BottomNav } from '../components/bottom-nav';
import { toast } from 'sonner';

export function GenerateInvitePage() {
    const navigate = useNavigate();
    const [code, setCode] = useState<string | null>(null);
    const [minutes, setMinutes] = useState<number>(60);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerateCode = async () => {
        try {
            setLoading(true);
            setError(null);
            const params = minutes > 0 ? { expiresInMinutes: minutes } : undefined;
            const { code } = await generateInviteCode(params);
            setCode(code);
        } catch (err) {
            console.error('Error al generar código:', err);
            setError('Error al generar el código. Intenta nuevamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = async () => {
        if (!code) return;
        try {
            await navigator.clipboard.writeText(code);
            toast('Código copiado al portapapeles');
        } catch (err) {
            console.error('Error al copiar:', err);
        }
    };

    return (
        <>
            <div className="flex px-6 flex-col min-h-screen mb-16">
                <Header title="Generar Invitación" onBack={() => navigate('/')} />

                <div className="max-w-3xl mx-auto w-full pt-6 space-y-6">
                    <div className="bg-white ">
                        <h2 className="text-lg font-semibold mb-6">Generar nuevo código de invitación</h2>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="minutes">Tiempo de expiración (minutos)</Label>
                                <Input
                                    id="minutes"
                                    type="number"
                                    min="0"
                                    value={minutes}
                                    onChange={(e) => setMinutes(Number(e.target.value))}
                                    placeholder="60"
                                />
                                <p className="text-sm text-muted-foreground">
                                    0 = Sin expiración
                                </p>
                            </div>

                            <Button
                                onClick={handleGenerateCode}
                                disabled={loading}
                                className="w-full"
                            >
                                {loading ? (
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                ) : (
                                    <Clock className="h-4 w-4 mr-2" />
                                )}
                                Generar Código
                            </Button>

                            {error && (
                                <p className="text-red-500 text-sm text-center">{error}</p>
                            )}

                            {code && (
                                <div className="mt-6">
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <p className="text-sm font-medium text-gray-500">Código generado:</p>
                                                <p className="text-3xl font-bold text-primary mt-1">{code}</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={handleCopy}
                                                className="gap-2"
                                            >
                                                <Copy className="h-4 w-4" />
                                                Copiar
                                            </Button>
                                        </div>

                                        {minutes > 0 && (
                                            <p className="text-sm text-gray-500 mt-3">
                                                Expira en {minutes} minutos
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <BottomNav />
        </>
    );
}