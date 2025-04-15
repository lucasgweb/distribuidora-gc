import { ChevronDown, ChevronUp, Clipboard, HandCoins } from "lucide-react";
import { BottomNav } from "../components/bottom-nav";
import { ChartFake } from "../components/chart-fake";
import { Header } from "../components/header";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card";
import { useHome } from "../hooks/use-home.hook";

export function HomePage() {

    const { user } = useHome();

    const salesData = {
        amount: "2,450",
        change: 12,
        isPositive: true
    };

    const ordersData = {
        amount: "48",
        change: 5,
        isPositive: false
    };
    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white px-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex items-center justify-between">
                        <Header title="Hello Eduardo 👋" />

                        {/* Status Desktop */}
                        <div className="hidden md:flex gap-4">
                            <Card className="w-[200px]">
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center justify-between">
                                        Ventas totales <HandCoins className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-2xl">S/ {salesData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${salesData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {salesData.isPositive ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {salesData.change}% vs ayer
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card className="w-[200px]">
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center justify-between">
                                        Pedidos <Clipboard className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-2xl">{ordersData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${ordersData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {ordersData.isPositive ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {ordersData.change}% vs ayer
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden">

                        <h2 className="text-2xl font-bold mt-4">Hola {user!.name.split(" ")[0]} 👋</h2>
                        <p className="text-gray-500">Bienvenido a tu panel de control</p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Card>
                                <CardHeader >
                                    <CardDescription className="flex items-center justify-between">
                                        Ventas totales <HandCoins className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-xl">S/ {salesData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${salesData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {salesData.isPositive ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {salesData.change}% vs ayer
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader >
                                    <CardDescription className="flex items-center justify-between">
                                        Pedidos <Clipboard className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-xl">{ordersData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${ordersData.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                                        {ordersData.isPositive ? (
                                            <ChevronUp className="h-4 w-4" />
                                        ) : (
                                            <ChevronDown className="h-4 w-4" />
                                        )}
                                        <span className="text-sm">
                                            {ordersData.change}% vs ayer
                                        </span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-6xl mx-auto px-6 mt-4 mb-22">

                <ChartFake />


                {/* Grid Principal */}
                <div className="grid md:grid-cols-2 gap-6 mt-4">
                    {/* Pedidos Recentes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Pedidos recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-2">
                            {[101, 102, 103].map((order) => (
                                <div
                                    key={order}
                                    className="flex justify-between items-center p-3 border-b border-gray-100"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="p-3 rounded-full border border-gray-100">

                                            <Clipboard className="h-5 w-5 text-gray-500" />
                                        </div>
                                        <div>

                                            <p className="font-medium">Pedido #{order}</p>
                                            <p className="text-sm text-muted-foreground">
                                                {order === 101 && "2 Galones e S/ 14.00"}
                                                {order === 102 && "3 Galones e S/ 21.00"}
                                                {order === 103 && "1 Galones e S/ 7.00"}
                                            </p>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-2 py-1 rounded-full text-sm font-medium ${order === 103
                                            ? " text-green-500"
                                            : " text-blue-500"
                                            }`}
                                    >
                                        {order === 103 ? "Completado" : "En proceso"}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Resumen Desktop */}
                    <div className="hidden md:block space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>S/N vs layer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-32 flex items-center justify-center">
                                    <span className="text-muted-foreground">Gráfico (placeholder)</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Estado de pedidos</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <span>Completado (32)</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                        <span>En proceso (16)</span>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
            <BottomNav />
        </div>
    );
}