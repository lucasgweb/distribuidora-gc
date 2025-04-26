/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react'
import { Download, Loader2 } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DateRange } from 'react-day-picker'
import { ClientSearch } from './client-search'
import { DateRangePicker } from './date-range-picker'
import { Button } from './ui/button'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { formatCurrency } from '../utils/format-currency'
import { ClientDTO } from '../dtos/client.dto'
import { UserDTO } from '../dtos/user.dto'
import { getReport } from '../services/sales-report.service'
import { SaleReportDTO, SalesReportFilterDTO } from '../dtos/sale-report.dto'
import { api } from '../lib/api'
import { Skeleton } from './ui/skeleton'

interface AdvancedSalesReportsProps {
    clients: ClientDTO[]
    sellers: UserDTO[]
}

const formatChartDate = (date: Date, mobile: boolean) => {
    return new Date(date).toLocaleDateString('es-PE', {
        day: 'numeric',
        month: mobile ? 'short' : '2-digit'
    })
}

export function AdvancedSalesReports({ clients, sellers }: AdvancedSalesReportsProps) {
    const [dateRange, setDateRange] = useState<DateRange>()
    const [selectedSeller, setSelectedSeller] = useState('all')
    const [selectedClient, setSelectedClient] = useState<ClientDTO | undefined>()
    const [clientSearchQuery, setClientSearchQuery] = useState('')
    const [salesData, setSalesData] = useState<SaleReportDTO[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>()

    // Agrupar dados por dia
    const chartData = useMemo(() => {
        const grouped = salesData.reduce((acc: Record<string, { total: number; quantity: number }>, item) => {
            const date = new Date(item.date).toISOString().split('T')[0]
            if (!acc[date]) {
                acc[date] = { total: 0, quantity: 0 }
            }
            acc[date].total += item.totalAmount
            acc[date].quantity += item.quantity
            return acc
        }, {})

        return Object.entries(grouped).map(([date, values]) => ({
            date,
            total: values.total,
            quantity: values.quantity
        }))
    }, [salesData])

    const salesByUser = useMemo(() => {
        return salesData.reduce((acc: { userId: string; userName: string; quantity: number; totalAmount: number }[], sale) => {
            const existing = acc.find(u => u.userId === sale.userId)
            if (existing) {
                existing.quantity += sale.quantity
                existing.totalAmount += sale.totalAmount
            } else {
                acc.push({
                    userId: sale.userId,
                    userName: sale.userName,
                    quantity: sale.quantity,
                    totalAmount: sale.totalAmount
                })
            }
            return acc
        }, [])
    }, [salesData])

    const fetchData = async () => {
        setIsLoading(true)
        setError(undefined)
        try {
            const filters: SalesReportFilterDTO = {
                startDate: dateRange?.from?.toISOString(),
                endDate: dateRange?.to?.toISOString(),
                clientId: selectedClient?.id,
                userId: selectedSeller === 'all' ? undefined : selectedSeller
            }
            const data = await getReport(filters)
            setSalesData(data)
        } catch (err) {
            setError('Error al cargar los datos. Por favor intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    const handleExport = async () => {
        setIsLoading(true)
        try {
            const filters: SalesReportFilterDTO = {
                startDate: dateRange?.from?.toISOString(),
                endDate: dateRange?.to?.toISOString(),
                clientId: selectedClient?.id,
                userId: selectedSeller === 'all' ? undefined : selectedSeller
            }
            const response = await api.get<Blob>('/reports/sales/export', {
                params: filters,
                responseType: 'blob',
            })
            const url = window.URL.createObjectURL(response.data)
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', 'reporte_ventas.xlsx')
            document.body.appendChild(link)
            link.click()
        } catch (err) {
            alert('Error al exportar el reporte')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, selectedSeller, selectedClient])

    // Estadísticas
    const totalSales = useMemo(() => salesData.reduce((sum, item) => sum + item.totalAmount, 0), [salesData])
    const totalQuantity = useMemo(() => salesData.reduce((sum, item) => sum + item.quantity, 0), [salesData])
    const averageTicket = useMemo(() => salesData.length ? totalSales / salesData.length : 0, [salesData, totalSales])

    return (
        <div className="space-y-4 p-2 pb-20">
            {/* Filtros */}
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <ClientSearch
                        clients={clients}
                        selectedClient={selectedClient}
                        onSelect={(client) => {
                            setSelectedClient(client)
                            setClientSearchQuery('')
                        }}
                        searchQuery={clientSearchQuery}
                        setSearchQuery={setClientSearchQuery}
                        isLoading={false}
                    />

                    <Select value={selectedSeller} onValueChange={setSelectedSeller}>
                        <SelectTrigger className="h-12 w-full">
                            <SelectValue placeholder="Seleccionar vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Todos los vendedores</SelectItem>
                            {sellers.map(seller => (
                                <SelectItem key={seller.id} value={seller.id}>
                                    {seller.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DateRangePicker
                        date={dateRange}
                        onDateChange={setDateRange}
                        className=""
                    />
                </div>

                <Button
                    onClick={handleExport}
                    disabled={isLoading}
                    className="h-12 w-full"
                >
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="mr-2 h-4 w-4" />
                    )}
                    Exportar Reporte
                </Button>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            {/* Estadísticas */}
            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <StatCard
                    title="Ventas Totales"
                    value={formatCurrency(totalSales)}
                    loading={isLoading}
                />
                <StatCard
                    title="Cantidad Total"
                    value={totalQuantity.toLocaleString('es-PE')}
                    loading={isLoading}
                />
                <StatCard
                    title="Ticket Promedio"
                    value={formatCurrency(averageTicket)}
                    loading={isLoading}
                />
                <StatCard
                    title="Total Ventas"
                    value={salesData.length.toLocaleString('es-PE')}
                    loading={isLoading}
                />
            </div>

            {/* Gráfico */}
            <Card className="shadow-sm">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg">Ventas por Día</CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                    <div className="h-[280px] sm:h-[320px]">
                        {isLoading ? (
                            <Skeleton className="h-full w-full" />
                        ) : (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                    <XAxis
                                        dataKey="date"
                                        tick={{ fontSize: 12 }}
                                        tickFormatter={(date) => formatChartDate(new Date(date), window.innerWidth < 768)}
                                        interval={window.innerWidth < 768 ? 2 : 0}
                                    />
                                    <YAxis
                                        width={75}
                                        tickFormatter={value => `S/${value}`}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        content={({ payload, label }) => (
                                            <CustomTooltip
                                                payload={payload}
                                                label={formatChartDate(new Date(label), false)}
                                            />
                                        )}
                                    />
                                    <Bar
                                        dataKey="total"
                                        fill="currentColor"
                                        className="text-primary"
                                        radius={[4, 4, 0, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Vistas Responsivas */}
            <MobileSalesView salesByUser={salesByUser} salesData={salesData} isLoading={isLoading} />
            <DesktopSalesView salesByUser={salesByUser} salesData={salesData} isLoading={isLoading} />
        </div>
    )
}

// Componentes auxiliares
const StatCard = ({ title, value, loading }: { title: string; value: string; loading: boolean }) => (
    <Card className="p-3 shadow-sm">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {loading ? (
            <Skeleton className="h-7 w-3/4 mt-1" />
        ) : (
            <div className="text-lg font-bold truncate">{value}</div>
        )}
    </Card>
)

const CustomTooltip = ({ payload, label }: any) => {
    if (!payload || payload.length === 0) return null
    return (
        <div className="bg-background p-3 rounded-lg shadow-lg border">
            <p className="font-medium">{label}</p>
            <p className="text-sm">{`Total: ${formatCurrency(payload[0].value)}`}</p>
            <p className="text-sm">{`Ventas: ${payload[0].payload.quantity}`}</p>
        </div>
    )
}

const MobileSalesView = ({ salesByUser, salesData, isLoading }: {
    salesByUser: Array<{ userId: string; userName: string; quantity: number; totalAmount: number }>
    salesData: SaleReportDTO[]
    isLoading: boolean
}) => (
    <div className="md:hidden space-y-4">
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Ventas por Vendedor</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-4">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <div key={i} className="px-4">
                                <Skeleton className="h-16 w-full" />
                            </div>
                        ))
                    ) : (
                        salesByUser.map((user) => (
                            <Card key={user.userId} className="mx-2 mb-2 p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">{user.userName}</div>
                                        <div className="text-sm text-muted-foreground">
                                            {user.quantity} ventas
                                        </div>
                                    </div>
                                    <div className="font-medium text-primary">
                                        {formatCurrency(user.totalAmount)}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Detalle de Ventas</CardTitle>
            </CardHeader>
            <CardContent className="px-0">
                <div className="space-y-2">
                    {isLoading ? (
                        Array(5).fill(0).map((_, i) => (
                            <Skeleton key={i} className="h-16 w-full mx-2" />
                        ))
                    ) : (
                        salesData.map((sale) => (
                            <Card key={sale.id} className="mx-2 mb-2 p-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-medium">
                                            {new Date(sale.date).toLocaleDateString('es-PE')}
                                        </div>
                                        <div className="text-sm text-muted-foreground truncate">
                                            {sale.clientName}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium">{formatCurrency(sale.totalAmount)}</div>

                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    </div>
)

const DesktopSalesView = ({ salesByUser, salesData, isLoading }: {
    salesByUser: Array<{ userId: string; userName: string; quantity: number; totalAmount: number }>
    salesData: SaleReportDTO[]
    isLoading: boolean
}) => (
    <div className="hidden md:block space-y-4">
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Ventas por Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Vendedor</TableHead>
                                <TableHead className="text-right">Ventas</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(3).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                salesByUser.map((user) => (
                                    <TableRow key={user.userId}>
                                        <TableCell className="font-medium">{user.userName}</TableCell>
                                        <TableCell className="text-right">{user.quantity}</TableCell>
                                        <TableCell className="text-right font-medium">
                                            {formatCurrency(user.totalAmount)}
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>

        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-lg">Detalle Completo</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Fecha</TableHead>
                                <TableHead>Cliente</TableHead>
                                <TableHead>Vendedor</TableHead>
                                <TableHead className="text-right">Cant</TableHead>
                                <TableHead className="text-right">Total</TableHead>
                                <TableHead>Método</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-6 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-28" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-24 ml-auto" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-20" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                salesData.map((sale) => (
                                    <TableRow key={sale.id}>
                                        <TableCell>{new Date(sale.date).toLocaleDateString('es-PE')}</TableCell>
                                        <TableCell className="max-w-[120px] truncate">
                                            {sale.clientName}
                                        </TableCell>
                                        <TableCell className="max-w-[100px] truncate">
                                            {sale.userName}
                                        </TableCell>
                                        <TableCell className="text-right">{sale.quantity}</TableCell>
                                        <TableCell className="text-right">
                                            {formatCurrency(sale.totalAmount)}
                                        </TableCell>
                                        <TableCell>{sale.paymentMethod}</TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    </div>
)