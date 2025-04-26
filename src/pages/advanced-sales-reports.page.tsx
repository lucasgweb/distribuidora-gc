import { useState, useEffect } from 'react'
import { listClients } from '../services/clients.service'
import { listUsers } from '../services/users.service'
import { ClientDTO } from '../dtos/client.dto'
import { UserDTO } from '../dtos/user.dto'
import { AdvancedSalesReports } from '../components/advanced-sales-reports'
import { BottomNav } from '../components/bottom-nav'
import { Header } from '../components/header'
import { useNavigate } from 'react-router-dom'
import { FullScreenLoader } from '../components/full-screen-loader'

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

    if (loadingClients || loadingUsers) {
        return <FullScreenLoader />
    }

    if (error) {
        return <div className="p-4 text-red-600">{error}</div>
    }

    return <>
        <div className="flex px-4 flex-col min-h-screen mb-16">
            <Header title="Reportes" onBack={() => navigate('/')} />

            <AdvancedSalesReports clients={clients} sellers={sellers} />

        </div>
        <BottomNav />
    </>
}
