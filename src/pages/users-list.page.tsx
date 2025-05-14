import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Input } from '../components/ui/input';
import { User } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { UserDTO } from '../dtos/user.dto';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { listUsers } from '../services/users.service';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import DefaultAvatar from './../assets/default-avatar.svg'
import { Skeleton } from '../components/ui/skeleton';
import { BottomNav } from '../components/bottom-nav';

export function UsersListPage() {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');
    const [users, setUsers] = useState<UserDTO[]>([]);
    const [loading, setLoading] = useState(false);

    const filteredUsers = users.filter(user => {
        const searchLower = search.toLowerCase();
        return (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower)
        );
    });
    const renderUserSkeletons = () => {
        return Array(4).fill(0).map((_, index) => (
            <Card key={`skeleton-${index}`} className="overflow-hidden bg-white">
                <CardContent className="p-0">
                    <div className="flex flex-col">
                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                            <div className="flex items-center gap-2">
                                <Skeleton className="w-10 h-10 rounded-full" />
                                <Skeleton className="h-5 w-32" />
                            </div>
                            <Skeleton className="h-4 w-24" />
                        </div>

                        <div className="px-4 py-2">
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                    <Skeleton className="h-4 w-40" />
                                    <Skeleton className="h-3 w-32" />
                                </div>
                                <Skeleton className="h-3 w-16" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        ));
    };
    const loadUsers = async () => {
        setLoading(true);
        try {
            const data = await listUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error al cargar usuarios:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    const getRoleLabel = (role: string) => {
        return role === 'ADMIN' ? 'Administrador' : 'Miembro';
    };

    const formatDate = (date: Date) => {
        return format(new Date(date), 'dd MMM yyyy', { locale: es });
    };

    return (
        <>
            <div className="flex px-4 flex-col max-w-6xl  mx-auto min-h-screen mb-16">
                <Header title="Usuarios" showMenu />

                <div className="pt-4 pb-4 mx-auto w-full">
                    <div className="flex items-center justify-between gap-2 mb-6">
                        <div className="flex flex-1 relative">
                            <Input
                                placeholder="Buscar usuarios por nombre o email..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="bg-white shadow-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-4 gap-3 grid grid-cols-1 md:grid-cols-2">
                        {filteredUsers.map(user => (
                            <Card
                                key={user.id}
                                className="cursor-pointer hover:bg-white transition-colors p-1 hover:shadow overflow-hidden bg-white"
                                onClick={() => navigate(`/edit-profile/${user.id}`)}
                            >
                                <CardContent className="p-0">
                                    <div className="flex flex-col">
                                        <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <Avatar className="w-10 h-10">
                                                    <AvatarImage src={user.avatarUrl} />
                                                    <AvatarFallback className=" text-white">
                                                        <img
                                                            src={DefaultAvatar}
                                                            alt="Fallback"
                                                            className="w-full h-full object-contain p-1"
                                                        />
                                                    </AvatarFallback>
                                                </Avatar>
                                                <h3 className="font-medium">
                                                    {user.name}
                                                </h3>
                                            </div>
                                            <span className={`text-sm font-semibold ${user.role === 'ADMIN' ? 'text-primary' : 'text-gray-600'
                                                }`}>
                                                {getRoleLabel(user.role)}
                                            </span>
                                        </div>

                                        <div className="px-4 py-3">
                                            <div className="flex justify-between items-center text-sm">
                                                <div className="text-gray-600">
                                                    <span className="block">{user.email}</span>
                                                    <span className="text-xs mt-1">
                                                        Registrado: {formatDate(user.createdAt)}
                                                    </span>
                                                </div>
                                                <span className="text-xs text-gray-500">
                                                    ID: {user.id.slice(0, 8)}...
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {loading && renderUserSkeletons()}

                        {!loading && filteredUsers.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="bg-gray-100 rounded-full p-4 mb-3">
                                    <User className="h-8 w-8 text-gray-400" />
                                </div>
                                <h3 className="text-lg font-medium text-gray-800">
                                    {users.length === 0
                                        ? 'No hay usuarios registrados'
                                        : 'No se encontraron resultados'}
                                </h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    {search && 'Prueba con otra búsqueda'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <BottomNav />
        </>
    );
}