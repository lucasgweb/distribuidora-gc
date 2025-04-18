import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import { ArrowRight, Ticket, Warehouse } from "lucide-react"; // Ícones similares aos da imagem
import { BottomNav } from "../components/bottom-nav";

export function RegisterMenuPage() {
    const navigate = useNavigate();

    return (
        <>
            <div className="px-6">
                <Header title="Nuevo registro" onBack={() => navigate('/')} />
                <div className="mt-6 space-y-4">
                    <button
                        onClick={() => navigate('/register-sale')}
                        className="w-full flex items-center p-8 justify-between border border-gray-200 rounded-xl  hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center space-x-4">
                            <Ticket className="w-5 h-5" />
                            <span className="text-lg ">Registrar venta</span>
                        </div>
                        <span className="text-gray-400"><ArrowRight /></span>
                    </button>

                    <button
                        onClick={() => navigate('/inventory-movement')}
                        className="w-full flex items-center justify-between border border-gray-200 rounded-xl p-8  hover:bg-gray-50 transition"
                    >
                        <div className="flex items-center space-x-4">
                            <Warehouse className="w-5 h-5" />
                            <span className="text-lg ">Inventario</span>
                        </div>
                        <span className="text-gray-400"><ArrowRight /></span>
                    </button>
                </div>
            </div>
            <BottomNav />
        </>
    );
}
