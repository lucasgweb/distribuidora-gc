export interface SaleReportDTO {
  id: string
  date: string
  clientId: string
  clientName: string
  userId: string
  userName: string
  quantity: number
  totalAmount: number
  paymentMethod:  'CASH' | 'YAPE'
  products: {
    productId: string
    productName: string
    quantity: number
    unitPrice: number
  }[]
}

export interface SalesReportFilterDTO {
  startDate?: string
  endDate?: string
  clientId?: string
  userId?: string
  paymentMethod?:  'CASH' | 'YAPE'
}
