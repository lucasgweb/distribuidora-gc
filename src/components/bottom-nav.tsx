import { Home, PieChart, Settings, Plus, NotepadText } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export function BottomNav() {
    const location = useLocation();
    const currentRoute = location.pathname;

    const navigate = useNavigate();

    const navItems = [
        { route: "/", icon: Home, label: "Inicio" },
        { route: "/sales-list", icon: NotepadText, label: "Ventas" },
        { type: "action" as const, icon: Plus },
        { route: "/reports", icon: PieChart, label: "Reportes" },
        { route: "/settings", icon: Settings, label: "Ajustes" },
    ];

    return (
        <nav className="fixed bottom-0 w-full bg-white border-t md:hidden pb-2">
            <div className="grid grid-cols-5 gap-1 p-2">
                {navItems.map((item, index) => {
                    if (item.type === "action") {
                        return (
                            <button
                                onClick={() => navigate('/register-menu')}
                                key={index}
                                className="bg-primary m-auto text-white p-2 rounded-full justify-center items-center align-middle flex h-13 w-13 shadow-lg hover:bg-primary/90 transition-colors"
                            >
                                <Plus className="w-6 h-6" />
                            </button>
                        );
                    }

                    const isActive = currentRoute === item.route;

                    return (
                        <button
                            onClick={() => navigate(item.route)}
                            key={index}
                            className={`flex flex-col items-center justify-center p-2 ${isActive ? "text-primary" : "text-gray-500"
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            <span className="text-xs mt-1">{item.label}</span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}