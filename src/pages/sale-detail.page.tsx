import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { Check } from "lucide-react";
import { Button } from "../components/ui/button";
import PaperSVG from "./../assets/papper.svg";

export function SaleDetail() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col min-h-screen">
            <div className="pb-24 max-w-2xl mx-auto w-full flex-1">

                <div className="px-4">

                    <Header title="Detalles de venta" onBack={() => navigate("/")} />
                </div>

                {/* Container principal com papel como fundo */}
                <div className="relative mt-12 h-[580px]">
                    {/* SVG do papel como fundo */}
                    <img
                        src={PaperSVG}
                        alt="papel rasgado"
                        className="absolute top-0  left-0 w-full object-cover pointer-events-none rounded-lg"
                    />

                    <div className="h-16 w-16 bg-primary flex justify-center items-center absolute rounded-full top-3 left-1/2 -translate-x-1/2">
                        <Check className="text-white" size={28} />
                    </div>

                    {/* Conteúdo sobreposto */}
                    <div className="relative z-10 p-16 space-y-6 h-full">
                        {/* Seção de Detalles */}
                        <div className="space-y-4">
                            <div className="space-y-4">
                                <div className="flex justify-between flex-col mt-4 items-center  p-4 rounded-md">
                                    <span className="font-medium text-xs ">Pago Total</span>
                                    <span className="text-3xl font-bold">$12.00</span>
                                </div>

                                <div className="space-y-6 texxt-xs">
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 text-md">Fecha</span>
                                        <span className="text-md">12 Mayo 2024</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium text-md">Marca</span>
                                        <span className="text-md">A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium text-md">Cantidad</span>
                                        <span className="text-md">1 Kilo</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium text-md">Reference num</span>
                                        <span className="text-md">101</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600  font-medium text-md">Cliente</span>
                                        <span className="text-md">Cliente A</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-600 font-medium text-md">Medio de pago</span>
                                        <span className="text-green-600 text-md">Efectivo</span>
                                    </div>
                                </div>
                            </div>


                        </div>
                    </div>

                    {/* Botão posicionado na parte inferior */}
                    <div className="absolute -bottom-6 left-0 right-0 px-6">
                        <Button
                            className="w-full"
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