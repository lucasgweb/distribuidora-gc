import { useState, useEffect } from 'react'
import { listClients } from '../services/clients.service'
import { listUsers } from '../services/users.service'
import { ClientDTO } from '../dtos/client.dto'
import { UserDTO } from '../dtos/user.dto'
import { AdvancedSalesReports } from '../components/advanced-sales-reports'
import { BottomNav } from '../components/bottom-nav'
import { Header } from '../components/header'
import { useNavigate } from 'react-router-dom'
import { Skeleton } from '../components/ui/skeleton'
import { Card, CardContent } from '../components/ui/card'
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/ui/accordion'

// Componente skeleton para el selector de cliente
const ClientSearchSkeleton = () => (
    <div className="relative">
        <Skeleton className="h-12 w-full rounded-md" />
    </div>
)

// Componente skeleton para el selector de vendedor
const SellerSelectSkeleton = () => (
    <Skeleton className="h-12 w-full rounded-md" />
)

// Componente skeleton para el selector de fechas
const DateRangePickerSkeleton = () => (
    <Skeleton className="h-12 w-full rounded-md" />
)

// Componente skeleton para las tarjetas de estadísticas
const StatCardSkeleton = () => (
    <Card className="p-3">
        <Skeleton className="h-4 w-20 mb-2" />
        <Skeleton className="h-7 w-3/4" />
    </Card>
)

// Componente skeleton para el gráfico
const ChartSkeleton = () => (
    <Card>
        <CardContent>
            <Skeleton className="h-64 w-full" />
        </CardContent>
    </Card>
)

// Componente skeleton para la tabla
const TableSkeleton = () => (
    <Card>
        <CardContent>
            <div className="overflow-x-auto">
                <div className="space-y-2">
                    <div className="flex gap-4 py-2 border-b">
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-20 ml-auto" />
                        <Skeleton className="h-5 w-24" />
                    </div>
                    {Array(4).fill(0).map((_, i) => (
                        <div key={i} className="flex gap-4 py-2 border-b">
                            <Skeleton className="h-5 w-40" />
                            <Skeleton className="h-5 w-16 ml-auto" />
                            <Skeleton className="h-5 w-20" />
                        </div>
                    ))}
                </div>
            </div>
        </CardContent>
    </Card>
)

// Componente skeleton para el acordeón
const AccordionSkeleton = () => (
    <Accordion type="multiple" className="space-y-2">
        <AccordionItem value="daily-sales">
            <AccordionTrigger>
                <Skeleton className="h-5 w-32" />
            </AccordionTrigger>
            <AccordionContent>
                <ChartSkeleton />
            </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sales-by-user">
            <AccordionTrigger>
                <Skeleton className="h-5 w-36" />
            </AccordionTrigger>
            <AccordionContent>
                <TableSkeleton />
            </AccordionContent>
        </AccordionItem>
    </Accordion>
)

export function AdvancedSalesReportsPage() {
    const [clients, setClients] = useState<ClientDTO[]>([])
    const [sellers, setSellers] = useState<UserDTO[]>([])
    const [loadingClients, setLoadingClients] = useState(true)
    const [loadingUsers, setLoadingUsers] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchClients() {
            try {
                const res = await listClients({})
                setClients(res.clients)
            } catch {
                setError('Error loading clients')
            } finally {
                setLoadingClients(false)
            }
        }
        async function fetchUsers() {
            try {
                const res = await listUsers()
                setSellers(res)
            } catch {
                setError('Error loading users')
            } finally {
                setLoadingUsers(false)
            }
        }
        fetchClients()
        fetchUsers()
    }, [])

    const isLoading = loadingClients || loadingUsers;

    return (
        <>
            <div className="flex px-4 flex-col max-w-6xl mx-auto min-h-screen mb-16">
                <Header title="Reportes" onBack={() => navigate('/')} />

                {error ? (
                    <div className="p-4 text-red-600">{error}</div>
                ) : isLoading ? (
                    <div className="space-y-4 p-2 pb-20">
                        <div className="flex flex-col gap-2">
                            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
                                <ClientSearchSkeleton />
                                <SellerSelectSkeleton />
                                <DateRangePickerSkeleton />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                            <StatCardSkeleton />
                        </div>

                        <AccordionSkeleton />
                    </div>
                ) : (
                    <AdvancedSalesReports clients={clients} sellers={sellers} />
                )}
            </div>
            <BottomNav />
        </>
    )
}