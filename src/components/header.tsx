/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    ArrowLeft,
    Menu,
    Package,
    User,
    UserPlus,
    Users,
    X,
    Home,
    NotepadText,
    Plus,
    PieChart,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "./ui/sheet";
import { Link } from "react-router-dom";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

import { useAuth } from "../hooks/use-auth.hook";
import DefaultAvatar from "../assets/default-avatar.svg";

type Props = {
    title: string;
    onBack?: () => void;
    closeIcon?: boolean;
    showMenu?: boolean; // Permite mostrar el menú cuando hay onBack
    hideAvatar?: boolean; // Permite ocultar el avatar
};

export function Header({
    title,
    onBack,
    closeIcon,
    showMenu = false,
    hideAvatar = false,
}: Props) {
    const { user } = useAuth();

    const navItems = [
        { route: "/", icon: Home, label: "Inicio" },
        { route: "/sales-list", icon: NotepadText, label: "Ventas" },
        { route: "/clients", icon: User, label: "Clientes" },
        { route: "/reports", icon: PieChart, label: "Reportes" },

        user?.role !== "MEMBER" && {
            route: "/users",
            icon: Users,
            label: "Usuarios",
        },
        { route: "/products", icon: Package, label: "Productos" },
        { route: "/inventory-movement-list", icon: Package, label: "Inventario" },
        user?.role !== "MEMBER" && {
            route: "/generate-invite",
            icon: UserPlus,
            label: "Generar invitación",
        },
    ].filter(Boolean) as Array<{
        route: string;
        icon: React.ComponentType<any>;
        label: string;
        type?: "action";
    }>;

    const renderMenuButton = () => (
        <Sheet>
            <SheetTrigger asChild>
                <button
                    className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none"
                    aria-label="Abrir menú"
                >
                    <Menu className="w-6 h-6 text-gray-700" />
                </button>
            </SheetTrigger>

            <SheetContent side="left" className="w-[300px] p-4">
                <div className="flex flex-col h-full">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-bold text-gray-800">Menú</h2>
                        <SheetClose>
                            <span className="sr-only">Cerrar menú</span>
                        </SheetClose>
                    </div>

                    <nav className="flex flex-col gap-2">
                        {navItems.map((item, idx) =>
                            item.type === "action" ? (
                                <button
                                    key={idx}
                                    onClick={() => window.location.assign(item.route)}
                                    className="bg-primary text-white p-3 rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 transition"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            ) : (
                                <Link
                                    key={idx}
                                    to={item.route}
                                    className="flex items-center gap-3 rounded-lg px-3 py-2 text-gray-500 transition-all hover:text-gray-900 hover:bg-gray-100"
                                >
                                    <item.icon className="w-5 h-5" />
                                    <span>{item.label}</span>
                                </Link>
                            )
                        )}
                    </nav>
                </div>
            </SheetContent>
        </Sheet>
    );

    const renderAvatar = () => {
        if (hideAvatar) return null;
        return (
            <Link
                to="/profile"
                className="hover:ring-2 ring-blue-200 rounded-full transition-all"
            >
                <Avatar className="w-12 h-12 border-2 bg-gray-50 border-white">
                    <AvatarImage src={user?.avatarUrl} />
                    <AvatarFallback className="bg-white p-1">
                        <img
                            src={DefaultAvatar}
                            alt="Imagen por defecto"
                            className="w-full h-full object-contain"
                        />
                    </AvatarFallback>
                </Avatar>
            </Link>
        );
    };

    return (
        <div className="flex items-center justify-between w-full py-2 bg-white">
            <div className="grid grid-cols-3 w-full items-center">
                {/* Coluna esquerda: Botão de regreso ou menu */}
                <div className="flex justify-start">
                    {onBack ? (
                        <button
                            className="flex items-center gap-2 font-semibold text-gray-700 hover:text-gray-900 transition-colors p-2"
                            onClick={onBack}
                            aria-label="Volver"
                        >
                            {closeIcon ? (
                                <X className="w-5 h-5" />
                            ) : (
                                <ArrowLeft className="w-6 h-6" />
                            )}
                        </button>
                    ) : (
                        showMenu && renderMenuButton()
                    )}
                    {onBack && showMenu && (
                        <div className="ml-2">{renderMenuButton()}</div>
                    )}
                </div>

                {/* Coluna central: Título sempre centrado */}
                <div className="flex justify-center">
                    <h1 className="text-lg font-semibold text-center text-nowrap">
                        {title}
                    </h1>
                </div>

                {/* Coluna direita: Avatar ou espaço vazio */}
                <div className="flex justify-end">{renderAvatar()}</div>
            </div>
        </div>
    );
}
