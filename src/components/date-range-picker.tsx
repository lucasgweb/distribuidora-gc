import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { Calendar } from "./ui/calendar"
import { DateRange } from "react-day-picker"
import { Button } from "./ui/button"
import { cn } from "../lib/utils"

interface DateRangePickerProps {
    date?: DateRange
    onDateChange: (date?: DateRange) => void
    className?: string
}

export function DateRangePicker({ date, onDateChange, className }: DateRangePickerProps) {
    return (
        <div className={cn("grid gap-2 w-full", className)}>
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant="outline"
                        className={cn(
                            "justify-start text-left font-normal w-full",
                            !date && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, yyyy", { locale: es })} -{" "}
                                    {format(date.to, "LLL dd, yyyy", { locale: es })}
                                </>
                            ) : (
                                format(date.from, "LLL dd, yyyy", { locale: es })
                            )
                        ) : (
                            <span>Seleccionar período</span>
                        )}
                    </Button>
                </PopoverTrigger>

                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        mode="range"
                        selected={date}
                        onSelect={onDateChange}
                        defaultMonth={date?.from}
                        numberOfMonths={2}
                        locale={es}
                    />
                </PopoverContent>
            </Popover>
        </div>
    )
}
