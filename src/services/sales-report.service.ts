import { SaleReportDTO, SalesReportFilterDTO } from "../dtos/sale-report.dto"
import { api } from "../lib/api"

 export async function getReport(filters: SalesReportFilterDTO): Promise<SaleReportDTO[]> {
        const response = await api.get<SaleReportDTO[]>('/reports/sales', { params: filters })
        return response.data
    }
