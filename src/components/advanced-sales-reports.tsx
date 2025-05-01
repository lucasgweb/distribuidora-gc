/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useMemo } from 'react'
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DateRange } from 'react-day-picker'
import { ClientSearch } from './client-search'
import { DateRangePicker } from './date-range-picker'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import { formatCurrency } from '../utils/format-currency'
import { ClientDTO } from '../dtos/client.dto'
import { UserDTO } from '../dtos/user.dto'
import { getReport } from '../services/sales-report.service'
import { SaleReportDTO, SalesReportFilterDTO } from '../dtos/sale-report.dto'
import { Skeleton } from './ui/skeleton'
import { useAuth } from '../hooks/use-auth.hook'
import { useMediaQuery } from 'usehooks-ts'

interface AdvancedSalesReportsProps {
    clients: ClientDTO[]
    sellers: UserDTO[]
}

export function AdvancedSalesReports({ clients, sellers }: AdvancedSalesReportsProps) {
    const { user } = useAuth()
    const isMember = user?.role === "MEMBER"
    const isMobile = useMediaQuery('(max-width: 768px)')

    const getCurrentMonthDateRange = (): DateRange => {
        const today = new Date()
        const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1)
        return {
            from: firstDayOfMonth,
            to: today
        }
    }

    const [dateRange, setDateRange] = useState<DateRange>(getCurrentMonthDateRange)
    const [selectedSeller, setSelectedSeller] = useState<string>(isMember && user?.id ? user.id : 'all')
    const [selectedClient, setSelectedClient] = useState<ClientDTO | undefined>()
    const [clientSearchQuery, setClientSearchQuery] = useState('')
    const [salesData, setSalesData] = useState<SaleReportDTO[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string>()

    const chartData = useMemo(() => {
        if (!dateRange.from || !dateRange.to) return []

        // Cria um array com todos os dias do intervalo selecionado
        const daysArray: Date[] = []
        let currentDate = new Date(dateRange.from)

        while (currentDate <= dateRange.to) {
            daysArray.push(new Date(currentDate))
            currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1))
        }

        // Formata as datas para YYYY-MM-DD
        const salesByDate = salesData.reduce((acc: Record<string, { total: number; quantity: number }>, item) => {
            const date = new Date(item.date).toISOString().split('T')[0]
            if (!acc[date]) {
                acc[date] = { total: 0, quantity: 0 }
            }
            acc[date].total += item.totalAmount
            acc[date].quantity += item.quantity
            return acc
        }, {})

        // Cria os dados do gráfico
        return daysArray.map(date => {
            const dateString = date.toISOString().split('T')[0]
            return {
                date: dateString,
                formattedDate: `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`,
                total: salesByDate[dateString]?.total || 0,
                quantity: salesByDate[dateString]?.quantity || 0
            }
        })
    }, [salesData, dateRange])

    const totalSales = useMemo(() => salesData.reduce((sum, item) => sum + item.totalAmount, 0), [salesData])
    const totalQuantity = useMemo(() => salesData.reduce((sum, item) => sum + item.quantity, 0), [salesData])
    const averageTicket = useMemo(() => salesData.length ? totalSales / salesData.length : 0, [salesData, totalSales])

    const salesByUser = useMemo(() => {
        return salesData.reduce((acc: Array<{ userId: string; userName: string; quantity: number; totalAmount: number }>, sale) => {
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
        try {
            const filters: SalesReportFilterDTO = {
                startDate: dateRange.from?.toISOString(),
                endDate: dateRange.to?.toISOString(),
                clientId: selectedClient?.id,
                userId: selectedSeller === 'all' ? undefined : selectedSeller
            }
            const data = await getReport(filters)
            setSalesData(data)
            setError(undefined)
        } catch (err) {
            setError('Error al cargar los datos. Por favor intente nuevamente.')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [dateRange, selectedSeller, selectedClient])

    const handleDateChange = (range?: DateRange) => {
        if (range?.from && range?.to) {
            const adjustedFrom = new Date(range.from)
            adjustedFrom.setHours(0, 0, 0, 0)

            const adjustedTo = new Date(range.to)
            adjustedTo.setHours(23, 59, 59, 999)

            setDateRange({
                from: adjustedFrom,
                to: adjustedTo
            })
        }
    }
    const DailySalesTable = () => (
        <div className="md:hidden space-y-2">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead>
                        <tr className="text-left border-b">
                            <th className="p-2">Fecha</th>
                            <th className="p-2">Ventas</th>
                            <th className="p-2 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {chartData.map((day, index) => (
                            <tr key={index} className="border-b">
                                <td className="p-2">{day.formattedDate}</td>
                                <td className="p-2">{day.quantity}</td>
                                <td className="p-2 text-right">{formatCurrency(day.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )

    return (
        <div className="space-y-4 p-2 pb-20">
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                    <ClientSearch
                        clients={clients}
                        selectedClient={selectedClient}
                        onSelect={setSelectedClient}
                        searchQuery={clientSearchQuery}
                        setSearchQuery={setClientSearchQuery}
                        isLoading={false}
                    />

                    <Select
                        value={selectedSeller}
                        onValueChange={setSelectedSeller}
                        disabled={isMember}
                    >
                        <SelectTrigger className="h-12 w-full">
                            <SelectValue placeholder="Seleccionar vendedor" />
                        </SelectTrigger>
                        <SelectContent>
                            {!isMember && <SelectItem value="all">Todos</SelectItem>}
                            {sellers.map(seller => (
                                <SelectItem key={seller.id} value={seller.id}>
                                    {seller.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <DateRangePicker
                        date={dateRange}
                        onDateChange={handleDateChange}
                    />
                </div>
            </div>

            {error && (
                <div className="p-3 bg-red-100 text-red-700 rounded-lg text-sm">
                    {error}
                </div>
            )}

            <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                <StatCard title="Ventas Totales" value={formatCurrency(totalSales)} loading={isLoading} />
                <StatCard title="Cantidad Total Ventas" value={totalQuantity.toLocaleString('es-PE')} loading={isLoading} />
                <StatCard title="Valor Promedio" value={formatCurrency(averageTicket)} loading={isLoading} />

            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ventas Diarias</CardTitle>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <Skeleton className="h-64 w-full" />
                    ) : isMobile ? (
                        <DailySalesTable />
                    ) : (
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={chartData}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis
                                        dataKey="dayOfMonth"
                                        tick={{ fontSize: 12 }}
                                        interval={0}
                                    />
                                    <YAxis
                                        width={80}
                                        tickFormatter={value => `S/${value}`}
                                        tick={{ fontSize: 12 }}
                                    />
                                    <Tooltip
                                        content={({ payload, label }) => (
                                            <CustomTooltip
                                                payload={payload}
                                                label={`Día ${label}`}
                                            />
                                        )}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="#2563eb"
                                        strokeWidth={2}
                                        dot={{ r: 4 }}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ventas por Vendedor</CardTitle>
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
                                            <TableCell>{user.userName}</TableCell>
                                            <TableCell className="text-right">{user.quantity}</TableCell>
                                            <TableCell className="text-right">
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
        </div>
    )
}

const StatCard = ({ title, value, loading }: { title: string; value: string; loading: boolean }) => (
    <Card className="p-3">
        <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
        {loading ? (
            <Skeleton className="h-7 w-3/4 mt-1" />
        ) : (
            <div className="text-lg font-bold truncate">{value}</div>
        )}
    </Card>
)

const CustomTooltip = ({ payload, label }: any) => {
    if (!payload?.[0]) return null
    return (
        <div className="bg-background p-3 rounded-lg shadow-lg border">
            <p className="font-medium">{label}</p>
            <p className="text-sm">{`Total: ${formatCurrency(payload[0].value)}`}</p>
            <p className="text-sm">{`Ventas: ${payload[0].payload.quantity}`}</p>
        </div>
    )
}