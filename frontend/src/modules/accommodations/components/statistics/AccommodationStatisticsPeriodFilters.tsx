import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { es } from "react-day-picker/locale/es"
import type { DateRange } from "react-day-picker"
import { CalendarDaysIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

export type StatisticsPeriod = "week" | "month" | "year" | "custom"

export interface StatisticsDateRange {
  from: string
  to: string
}

interface AccommodationStatisticsPeriodFiltersProps {
  showPeriodFilters: boolean
  periodFilterLabel: string
  period: StatisticsPeriod
  range: StatisticsDateRange
  onPeriodChange: (period: StatisticsPeriod) => void
  onRangeChange: (range: StatisticsDateRange) => void
}

const periods: { value: StatisticsPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
]

export default function AccommodationStatisticsPeriodFilters({
  showPeriodFilters,
  periodFilterLabel,
  period,
  range,
  onPeriodChange,
  onRangeChange,
}: AccommodationStatisticsPeriodFiltersProps) {
  const [calendarOpen, setCalendarOpen] = useState(false)
  const selectedFrom = range.from ? parseISO(range.from) : undefined
  const selectedTo = range.to ? parseISO(range.to) : undefined
  const selectedRange = selectedFrom && isValid(selectedFrom)
    ? { from: selectedFrom, ...(selectedTo && isValid(selectedTo) ? { to: selectedTo } : {}) }
    : undefined

  function updateRange(selected: DateRange | undefined) {
    if (!selected?.from) {
      onRangeChange({ from: "", to: "" })
      return
    }

    onRangeChange({
      from: format(selected.from, "yyyy-MM-dd"),
      to: selected.to ? format(selected.to, "yyyy-MM-dd") : "",
    })
    if (selected.to) setCalendarOpen(false)
  }

  const rangeLabel = selectedRange?.from
    ? `${format(selectedRange.from, "d MMM yyyy", { locale: es })}${selectedRange.to ? ` – ${format(selectedRange.to, "d MMM yyyy", { locale: es })}` : " – Elegí una fecha"}`
    : "Seleccionar fechas"

  return <section className="w-fit flex items-center gap-2">
    {showPeriodFilters &&
      <div className="flex flex-wrap gap-1" role="group"
        aria-label={periodFilterLabel}>
        {periods.map(({ value, label }) =>
          <Button key={value} type="button" size="lg"
            className={`p-4 cursor-pointer ${period === value ? "bg-green-600 text-white hover:bg-green-600" : ""}`}
            variant={period === value ? "default" : "outline"}
            aria-pressed={period === value}
            onClick={() => onPeriodChange(value)}>{label}
          </Button>)}
      </div>}
    <div className=" flex flex-wrap gap-1" role="group">
      <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
        <PopoverTrigger
          render={<Button type="button" size="lg" variant="outline"
             className="w-fit justify-start text-left font-normal" aria-label="Rango de fechas" />}
        >
          <CalendarDaysIcon className="size-4" />
          <span className="truncate">{rangeLabel}</span>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-auto p-0">
          <Calendar
            mode="range"
            locale={es}
            selected={selectedRange}
            onSelect={updateRange}
            defaultMonth={selectedRange?.from}
            numberOfMonths={2}
            resetOnSelect
            aria-label="Seleccionar rango de fechas"
          />
        </PopoverContent>
      </Popover>
    </div>
  </section>
}
