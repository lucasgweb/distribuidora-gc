import { useNavigate } from "react-router-dom";
import { Header } from "../components/header";
import {
    ArrowRight,
    ShoppingCart,
    Package,
    User,
    Warehouse
} from "lucide-react";
import { BottomNav } from "../components/bottom-nav";
import { Card } from "../components/ui/card";

// Componente para cada opción del menú
interface MenuOptionProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    onClick: () => void;
    lightColor: string;
}

const MenuOption = ({ icon, title, description, onClick, lightColor }: MenuOptionProps) => (
    <Card
        className="w-full p-0 cursor-pointer transition-all hover:shadow-md border-gray-200"
        onClick={onClick}
    >
        <div className="flex items-start p-5">
            <div
                className={`flex-shrink-0 flex items-center justify-center rounded-lg p-3 ${lightColor}`}
            >
                {icon}
            </div>
            <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium">{title}</h3>
                <p className="mt-1 text-sm text-gray-500">{description}</p>
            </div>
            <ArrowRight className="flex-shrink-0 ml-1 text-gray-400 w-5 h-5 self-center" />
        </div>
    </Card>
);

export function RegisterMenuPage() {
    const navigate = useNavigate();

    // Definiciones para las opciones del menú
    const menuOptions = [
        {
            icon: <ShoppingCart className="w-6 h-6 text-primary" />,
            title: "Registrar venta",
            description: "Crear una nueva venta con productos",
            onClick: () => navigate('/register-sale'),
            lightColor: "bg-primary/15"
        },
        {
            icon: <User className="w-6 h-6 text-primary" />,
            title: "Registrar cliente",
            description: "Añadir un nuevo cliente al sistema",
            onClick: () => navigate('/clients/new'),
            lightColor: "bg-primary/15"
        },
        {
            icon: <Package className="w-6 h-6 text-primary" />,
            title: "Registrar producto",
            description: "Añadir un nuevo producto al catálogo",
            onClick: () => navigate('/products/new'),
            lightColor: "bg-primary/15"
        },
        {
            icon: <Warehouse className="w-6 h-6 text-primary" />,
            title: "Movimiento de inventario",
            description: "Registrar entrada o salida de productos",
            onClick: () => navigate('/inventory-movement'),
            lightColor: "bg-primary/15"
        }
    ];

    return (
        <div className="flex flex-col min-h-screen">
            <div className="px-6 flex-grow pb-20">
                <Header title="Nuevo registro" onBack={() => navigate('/')} />

                <div className="mt-2 max-w-2xl mx-auto">
                    <div className="grid gap-4">
                        {menuOptions.map((option, index) => (
                            <MenuOption
                                key={index}
                                {...option}
                            />
                        ))}
                    </div>
                </div>
            </div>
            <BottomNav />
        </div>
    );
}