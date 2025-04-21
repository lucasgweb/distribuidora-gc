import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Settings, LogOut } from "lucide-react";
import { useAuth } from "../hooks/use-auth.hook";
import { toast } from "sonner";

import DefaultAvatar from './../assets/default-avatar.svg'
import { Separator } from "../components/ui/separator";
import { Header } from "../components/header";

export function ProfilePage() {
    const navigate = useNavigate();
    const { logout, user } = useAuth();

    const handleLogout = () => {
        logout();
        toast.success("Sesión cerrada correctamente");
        navigate("/login");
    };

    return (
        <div className="flex flex-col h-screen px-4 ">
            <Header title="Perfil" onBack={() => navigate(-1)} />

            <div className=" pt-10">
                <div className="flex flex-col items-center mb-8">
                    <Avatar className="w-32 h-32 mb-4">
                        <AvatarFallback className="text-white text-2xl">
                            <img src={DefaultAvatar} alt="" className="w-full h-full object-contain" />
                        </AvatarFallback>
                    </Avatar>

                    <h2 className="text-xl font-semibold mb-1">{user?.name || 'Eduardo'}</h2>
                    <p className="text-gray-600">{user?.email || 'qemple@como.pe'}</p>
                </div>


                <Separator />

                <div className="space-y-1 py-10">
                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2"
                        onClick={() => navigate(`/edit-profile/${user?.id}`)}
                    >
                        <Settings className="w-4 h-4" />
                        Editar perfil
                    </Button>

                    <Button
                        variant="ghost"
                        className="w-full justify-start gap-2 text-red-500 hover:text-red-600"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Cerrar sesión
                    </Button>
                </div>
            </div>
        </div>
    );
}