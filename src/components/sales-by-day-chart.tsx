// src/components/SalesByDayChart.tsx
import { Bar, BarChart, CartesianGrid, LabelList, XAxis } from "recharts"
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../components/ui/card"
import {
    ChartConfig,
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
} from "../components/ui/chart"

// ajustamos o shape de entrada para o day/total que o back retorna
export interface SalesByDay {
    day: string   // "D", "L", "M", "M", "J", "V", "S"
    total: number // valor de vendas
}

// mapeamos para o formato que o recharts espera
function buildChartData(data: SalesByDay[]) {
    return data.map((item) => ({
        month: item.day,
        desktop: item.total,
    }))
}

// config permanece igual
const chartConfig = {
    desktop: {
        label: "Ventas",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function SalesByDayChart({ data }: { data: SalesByDay[] }) {
    const chartData = buildChartData(data)

    return (
        <Card>
            <CardHeader>
                <CardTitle>Ventas por día</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 40 }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent hideLabel />}
                        />
                        <Bar dataKey="desktop" fill="var(--color-desktop)" radius={8}>
                            <LabelList
                                position="top"
                                offset={12}
                                className="fill-foreground"
                                fontSize={12}
                            />
                        </Bar>
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    )
}
