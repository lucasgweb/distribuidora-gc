// SaleDetail.tsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Header } from "../components/header";
import { Check } from "lucide-react";
import { Button } from "../components/ui/button";
import PaperSVG from "./../assets/papper.svg";
import { SaleDTO } from "../dtos/sale.dto";
import { getSale } from "../services/sales.service";
import dayjs from "dayjs";
import "dayjs/locale/es";
import localizedFormat from "dayjs/plugin/localizedFormat";
import { FullScreenLoader } from "../components/full-screen-loader";

dayjs.locale("es");
dayjs.extend(localizedFormat);

export function SaleFinished() {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>();
    const [sale, setSale] = useState<SaleDTO | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSale = async () => {
            try {
                if (!id) throw new Error("ID de venta no proporcionado");
                const saleData = await getSale(id);
                setSale(saleData);
            } catch (err) {
                console.error("Error al obtener la venta:", err);
                navigate("/");
            } finally {
                setLoading(false);
            }
        };

        fetchSale();
        document.body.classList.add("overflow-hidden");
        return () => document.body.classList.remove("overflow-hidden");
    }, [id, navigate]);

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("es-PE", {
            style: "currency",
            currency: "PEN",
            minimumFractionDigits: 2
        }).format(value);
    };

    if (loading) return <FullScreenLoader />;
    if (!sale) return <div className="p-4 text-center">Venta no encontrada</div>;

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
                                <span className="font-medium text-sm mb-2">Pago Total</span>
                                <span className={`text-3xl font-bold animate-amount-pop ${sale.totalAmount < 0 ? "text-destructive" : "text-green-600"
                                    }`}>
                                    {formatCurrency(sale.totalAmount)}
                                </span>
                            </div>

                            <div className="space-y-6 text-sm">
                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600">Fecha</span>
                                    <span>{dayjs(sale.createdAt).format("LL")}</span>
                                </div>

                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Total Items</span>
                                    <span>{sale.items.length}</span>
                                </div>

                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Deuda</span>
                                    <span>{formatCurrency(sale.debt)}</span>
                                </div>

                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Cliente</span>
                                    <span>{sale.client.name}</span>
                                </div>

                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Vendedor</span>
                                    <span>{sale.user.name}</span>
                                </div>

                                <div className="flex justify-between animate-fade-in-delay">
                                    <span className="text-gray-600 font-medium">Medio de pago</span>
                                    <span>
                                        {sale.paymentMethod === "CASH" ? "Efectivo" : "Yape"}
                                    </span>
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