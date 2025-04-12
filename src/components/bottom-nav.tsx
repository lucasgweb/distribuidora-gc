import { Home, PieChart, Settings, Users, Plus } from "lucide-react";

export function BottomNav() {
    return (
        <nav className="fixed bottom-0 w-full bg-white border-t md:hidden pb-2">


            <div className="grid grid-cols-5 gap-1 p-2 ">
                <button className="flex flex-col items-center justify-center p-2 text-primary">
                    <Home className="w-5 h-5" />
                    <span className="text-xs mt-1">Inicio</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-gray-500">
                    <Users className="w-5 h-5" />
                    <span className="text-xs mt-1">Choferes</span>
                </button>
                <button className="bg-primary m-auto text-white p-2 rounded-full justify-center items-center align-middle flex h-12 w-12 shadow-lg hover:bg-primary/90 transition-colors">
                    <Plus className="w-6 h-6" />
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-gray-500">
                    <PieChart className="w-5 h-5" />
                    <span className="text-xs mt-1">Reportes</span>
                </button>
                <button className="flex flex-col items-center justify-center p-2 text-gray-500">
                    <Settings className="w-5 h-5" />
                    <span className="text-xs mt-1">Ajustes</span>
                </button>
            </div>
        </nav>
    )
}