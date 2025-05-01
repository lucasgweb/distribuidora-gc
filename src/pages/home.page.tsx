import { ChevronDown, ChevronUp, Clipboard, HandCoins } from "lucide-react"
import { BottomNav } from "../components/bottom-nav"
import { Header } from "../components/header"
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "../components/ui/card"
import { useHome } from "../hooks/use-home.hook"
import { SalesByDayChart } from "../components/sales-by-day-chart"
import { SalesByDay } from "../services/dashboard.service"
import { FullScreenLoader } from "../components/full-screen-loader"
import { SaleCard } from "../components/sale-card"

export function HomePage() {
    const { user, dashboardData, isLoading, isError } = useHome()

    if (isLoading) {
        return <FullScreenLoader />
    }

    if (isError || !dashboardData) {
        return <div className="flex items-center justify-center h-screen">Erro ao carregar dados</div>
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
                    <div className="flex items-center justify-between">
                        <Header title={`Hola ${user!.name.split(" ")[0]} 👋`} />

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
                                    <div className={`flex items-center gap-1 mt-1 ${salesData.isPositive ? 'text-green-600' : 'text-red-600'
                                        }`}>
                                        {salesData.isPositive ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                        <span className="text-sm">{salesData.change.toFixed(2)}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="w-[200px]">
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
                                        <span className="text-sm">{salesData.change}% vs ayer</span>
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
                                        <span className="text-sm">{ordersData.change}% vs ayer</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </header>

            {/* Conteúdo Principal */}
            <main className="max-w-6xl mx-auto px-4 mt-4 mb-22 space-y-6">
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
                                <SaleCard sale={sale} />
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
                                <div className="h-32 flex items-center justify-center">
                                    <span className="text-muted-foreground">Gráfico (placeholder)</span>
                                </div>
                            </CardContent>
                        </Card>


                    </div>
                </div>
            </main>

            <BottomNav />
        </div>
    )
}
