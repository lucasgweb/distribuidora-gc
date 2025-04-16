// SaleDetail.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { Check } from "lucide-react";
import { Button } from "../components/ui/button";
import PaperSVG from "./../assets/papper.svg";

export function SaleDetail() {
    const navigate = useNavigate();

    useEffect(() => {
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <div className="pb-24 max-w-2xl mx-auto w-full flex-1">
                <div className="px-6">
                    <Header
                        title="Detalles de venta"
                        onBack={() => navigate("/")}
                        closeIcon
                    />
                </div>

                <div className="relative mt-12 h-[590px]">
                    <img
                        src={PaperSVG}
                        alt="papel rasgado"
                        className="absolute top-0 left-0 w-full object-cover pointer-events-none rounded-lg animate-paper-enter"
                    />

                    <div className="absolute top-3 left-1/2 -translate-x-1/2">
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 bg-primary/30 rounded-full animate-ping-once" />
                            <div className="h-16 w-16 bg-primary flex justify-center items-center rounded-full relative animate-scale-up">
                                <Check className="text-white animate-check-in" size={28} />
                            </div>
                        </div>
                    </div>

                    <div className="relative z-10 p-14 sm:p-16 space-y-6 h-full animate-content-enter">
                        <div className="space-y-4">
                            <div className="flex justify-between flex-col mt-8 items-center p-4 rounded-md">
                                <span className="font-medium text-xs">Pago Total</span>
                                <span className="text-3xl font-bold animate-amount-pop">$12.00</span>
                            </div>

                            <div className="space-y-6 text-sm">
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600">Fecha</span>
                                    <span>12 Mayo 2024</span>
                                </div>
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Marca</span>
                                    <span>A</span>
                                </div>
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Cantidad</span>
                                    <span>1 Kilo</span>
                                </div>
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Número de referencia</span>
                                    <span>101</span>
                                </div>
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Cliente</span>
                                    <span>Cliente A</span>
                                </div>
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Medio de pago</span>
                                    <span className="text-green-600">Efectivo</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="absolute -bottom-6 left-0 right-0 px-6 animate-button-enter">
                        <Button
                            className="w-full shadow-lg hover:scale-[1.02] transition-transform"
                            onClick={() => navigate("/")}
                        >
                            Volver a la página de inicio
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}