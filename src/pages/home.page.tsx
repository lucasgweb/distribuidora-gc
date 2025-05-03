import { ChevronDown, ChevronUp, Clipboard, HandCoins, Menu } from "lucide-react"
import { BottomNav } from "../components/bottom-nav"
import { Header } from "../components/header"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card"
import { Skeleton } from "../components/ui/skeleton"
import { Avatar, AvatarFallback } from "../components/ui/avatar"
import { useHome } from "../hooks/use-home.hook"
import { SalesByDayChart } from "../components/sales-by-day-chart"
import { SalesByDay } from "../services/dashboard.service"
import { SaleCard } from "../components/sale-card"
import { formatCurrency } from "../utils/format-currency"
import DefaultAvatar from './../assets/default-avatar.svg'

// Componente para el skeleton del Header cuando no hay onBack
const HeaderSkeleton = () => {
    return (
        <div className="flex items-center flex-1 gap-4 justify-between">
            <div className="p-2 rounded-lg">
                <Menu className="w-6 h-6 text-gray-300" />
            </div>

            <Avatar className="w-13 h-13 border-2 bg-gray-50 border-white">
                <AvatarFallback className="bg-white p-1">
                    <img
                        src={DefaultAvatar}
                        alt="Imagen por defecto"
                        className="w-full h-full object-contain opacity-50"
                    />
                </AvatarFallback>
            </Avatar>
        </div>
    )
}

// Componente para el skeleton del gráfico
const ChartSkeleton = () => {
    return (
        <Card>
            <CardHeader>
                <Skeleton className="h-8 w-48" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-[180px] w-full" />
            </CardContent>
        </Card>
    )
}

// Componente para skeleton de tarjeta de estado
const StatCardSkeleton = () => {
    return (
        <Card>
            <CardHeader className="pb-2">
                <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
                <Skeleton className="h-8 w-20 mb-2" />
                <Skeleton className="h-4 w-24" />
            </CardContent>
        </Card>
    )
}

// Componente para skeleton de tarjeta de venta
const SaleCardSkeleton = () => {
    return (
        <div className="p-4 border rounded-lg">
            <div className="flex justify-between items-start">
                <div>
                    <Skeleton className="h-5 w-36 mb-2" />
                    <Skeleton className="h-4 w-24" />
                </div>
                <Skeleton className="h-6 w-20" />
            </div>
            <div className="mt-2">
                <Skeleton className="h-4 w-32" />
            </div>
        </div>
    )
}

export function HomePage() {
    const { user, dashboardData, isLoading } = useHome()

    // Renderizar skeletons durante la carga
    if (isLoading || !dashboardData) {
        return (
            <div className="min-h-screen bg-white">
                {/* Header Skeleton */}
                <header className="bg-white px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex items-center justify-between py-4">
                            <HeaderSkeleton />
                        </div>

                        {/* Mobile Header Skeleton */}
                        <div className="md:hidden mt-4">
                            <Skeleton className="h-8 w-48 mb-2" />
                            <Skeleton className="h-4 w-64" />

                            <div className="grid grid-cols-2 gap-4 mt-4">
                                <StatCardSkeleton />
                                <StatCardSkeleton />
                            </div>
                        </div>

                        {/* Status Desktop Skeleton */}
                        <div className="hidden md:flex gap-4 mt-4">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>
                    </div>
                </header>

                {/* Contenido Principal Skeleton */}
                <main className="max-w-6xl mx-auto px-4 mt-4 mb-22 space-y-6">
                    {/* Gráfico Skeleton */}
                    <ChartSkeleton />

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Pedidos Recientes Skeleton */}
                        <Card>
                            <CardHeader>
                                <Skeleton className="h-6 w-40" />
                            </CardHeader>
                            <CardContent className="space-y-4 p-2">
                                {Array(3).fill(0).map((_, index) => (
                                    <SaleCardSkeleton key={index} />
                                ))}
                            </CardContent>
                        </Card>

                        {/* Resumen Desktop Skeleton */}
                        <div className="hidden md:block space-y-6">
                            <Card>
                                <CardHeader>
                                    <Skeleton className="h-6 w-32" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-32 w-full" />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </main>

                <BottomNav />
            </div>
        )
    }

    const salesData = {
        amount: dashboardData.totalSalesAmount.toLocaleString(),
        change: dashboardData.salesComparison,
        isPositive: dashboardData.salesComparison >= 0,
    }

    const ordersData = {
        amount: dashboardData.totalOrders.toString(),
        change: dashboardData.ordersComparison,
        isPositive: dashboardData.ordersComparison >= 0,
    }

    return (
        <div className="min-h-screen bg-white">
            {/* Header */}
            <header className="bg-white px-4">
                <div className="max-w-6xl mx-auto">
                    <div className="flex flex-col items-center justify-between">
                        <Header showMenu title="Início" />

                        {/* Status Desktop */}
                        <div className="hidden md:flex gap-4 px-4 w-full">
                            <Card className="flex flex-1 w-full">
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center justify-between">
                                        Ventas totales <HandCoins className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-2xl">{formatCurrency(Number(salesData.amount))}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${salesData.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {salesData.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="text-sm">{salesData.change.toFixed(2)}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="flex flex-1 w-full">
                                <CardHeader className="pb-2">
                                    <CardDescription className="flex items-center justify-between">
                                        Ventas <Clipboard className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-2xl">{ordersData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${ordersData.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {ordersData.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="text-sm">{ordersData.change.toFixed(2)}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    {/* Mobile Header */}
                    <div className="md:hidden mt-4">
                        <h2 className="text-2xl font-bold">Hola {user!.name.split(" ")[0]} 👋</h2>
                        <p className="text-gray-500">Bienvenido a tu panel de control</p>

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <Card>
                                <CardHeader>
                                    <CardDescription className="flex items-center justify-between">
                                        Ventas totales <HandCoins className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-xl">S/ {salesData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${salesData.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {salesData.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="text-sm">{salesData.change.toFixed(2)}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardDescription className="flex items-center justify-between">
                                        Pedidos <Clipboard className="h-4 w-4" />
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <CardTitle className="text-xl">{ordersData.amount}</CardTitle>
                                    <div className={`flex items-center gap-1 mt-1 ${ordersData.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {ordersData.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="text-sm">{ordersData.change.toFixed(2)}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-6xl mx-auto mt-4 px-4 mb-22 space-y-6">
                {/* Gráfico de vendas por dia */}
                <SalesByDayChart data={dashboardData.salesByDay as SalesByDay[]} />

                <div className="grid md:grid-cols-2 gap-6">
                    {/* Pedidos Recentes */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Ventas recientes</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 p-2">
                            {dashboardData.recentSales.map((sale) => (
                                <SaleCard key={sale.id} sale={sale} />
                            ))}
                        </CardContent>
                    </Card>

                    {/* Resumen Desktop */}
                    <div className="hidden md:block space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>S/N vs ayer</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {dashboardData.recentSales.map((sale) => (
                                    <SaleCard key={sale.id} sale={sale} />
                                ))}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}