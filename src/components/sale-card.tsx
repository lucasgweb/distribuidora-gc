import { CreditCard, Calendar, User } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useNavigate } from 'react-router-dom'
import { Card, CardContent } from './ui/card'
import { SaleDTO } from '../dtos/sale.dto'



interface SaleCardProps {
    sale: SaleDTO
}

export function SaleCard({ sale }: SaleCardProps) {
    const navigate = useNavigate()

    // Função para formatar moeda (implementação de exemplo)
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN'
        }).format(value)
    }

    const getPaymentMethodLabel = (method: string) => {
        return method === 'CASH' ? 'Efectivo' : 'Yape'
    }


    return (
        <Card
            className="cursor-pointer hover:bg-white transition-colors p-1 hover:shadow overflow-hidden bg-white"
            onClick={() => navigate(`/sale-detail/${sale.id}`)}
        >
            <CardContent className="p-0">
                <div className="flex flex-col">
                    {/* Cabeçalho com ID e Valor */}
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            #{sale.code}
                            <h3 className="font-medium">{sale.client.name}</h3>
                        </div>
                        <span className="font-semibold text-green-600">
                            {formatCurrency(sale.totalAmount)}
                        </span>
                    </div>

                    {/* Detalhes */}
                    <div className="px-4 py-3">
                        <div className="flex justify-between items-center text-sm">
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-gray-600">
                                    <CreditCard className="w-4 h-4" />
                                    {getPaymentMethodLabel(sale.paymentMethod)}
                                </div>

                                <div className="flex items-center gap-1 text-gray-600">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-xs">
                                        {format(new Date(sale.createdAt), 'dd MMM yyyy HH:mm', {
                                            locale: es
                                        })}
                                    </span>
                                </div>
                            </div>

                            {
                                sale.user && (
                                    <div className="flex items-center gap-4">
                                        <div className="flex items-center gap-1 text-gray-600">
                                            <User className="w-4 h-4" />
                                            <span className="text-xs">{sale.user?.name}</span>
                                        </div>
                                    </div>
                                )
                            }

                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}