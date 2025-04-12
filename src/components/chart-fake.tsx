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
const chartData = [
    { month: "L", desktop: 186 },
    { month: "M", desktop: 305 },
    { month: "M", desktop: 237 },
    { month: "J", desktop: 73 },
    { month: "V", desktop: 209 },
    { month: "S", desktop: 214 },
    { month: "Hoy", desktop: 214 },
]

const chartConfig = {
    desktop: {
        label: "Ventas",
        color: "var(--chart-1)",
    },
} satisfies ChartConfig

export function ChartFake() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Ventas por dia</CardTitle>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig}>
                    <BarChart
                        accessibilityLayer
                        data={chartData}
                        margin={{
                            top: 20,
                        }}
                    >
                        <CartesianGrid vertical={false} />
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
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
