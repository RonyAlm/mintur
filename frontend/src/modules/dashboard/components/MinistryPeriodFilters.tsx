import { useState } from "react"
import { format, isValid, parseISO } from "date-fns"
import { es } from "react-day-picker/locale/es"
import type { DateRange } from "react-day-picker"
import { CalendarDaysIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import type { DashboardDateRange, MinistryPeriod } from "../types/dashboard.types"

const PERIODS: { value: MinistryPeriod; label: string }[] = [
  { value: "7d", label: "Últimos 7 días" },
  { value: "30d", label: "Últimos 30 días" },
  { value: "month", label: "Mes actual" },
  { value: "custom", label: "Personalizado" },
]

interface MinistryPeriodFiltersProps {
  period: MinistryPeriod
  range: DashboardDateRange
  onPeriodChange: (period: MinistryPeriod) => void
  onRangeChange: (range: DashboardDateRange) => void
}

export default function MinistryPeriodFilters({
  period,
  range,
  onPeriodChange,
  onRangeChange,
}: MinistryPeriodFiltersProps) {
  const [open, setOpen] = useState(false)

  const selectedFrom = range.from ? parseISO(range.from) : undefined
  const selectedTo = range.to ? parseISO(range.to) : undefined
  const selected =
    selectedFrom && isValid(selectedFrom)
      ? { from: selectedFrom, ...(selectedTo && isValid(selectedTo) ? { to: selectedTo } : {}) }
      : undefined

  function updateRange(next: DateRange | undefined) {
    if (!next?.from) {
      onRangeChange({ from: "", to: "" })
      return
    }
    onRangeChange({
      from: format(next.from, "yyyy-MM-dd"),
      to: next.to ? format(next.to, "yyyy-MM-dd") : "",
    })
    if (next.to) setOpen(false)
  }

  const rangeLabel = selected?.from
    ? `${format(selected.from, "d MMM yyyy", { locale: es })}${selected.to ? ` – ${format(selected.to, "d MMM yyyy", { locale: es })}` : " – Elegí una fecha"}`
    : "Seleccionar fechas"

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={period} onValueChange={(value) => onPeriodChange(value as MinistryPeriod)}>
        <SelectTrigger aria-label="Seleccionar período" className="h-9 w-fit min-w-44">
          <SelectValue>
            {(value) => PERIODS.find((item) => item.value === value)?.label ?? "Seleccionar período"}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map(({ value, label }) => (
            <SelectItem key={value} value={value}>
              {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {period === "custom" && (
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 justify-start font-normal"
                aria-label="Rango de fechas"
              />
            }
          >
            <CalendarDaysIcon className="size-4" />
            <span className="truncate">{rangeLabel}</span>
          </PopoverTrigger>
          <PopoverContent align="start" className="w-auto p-0">
            <Calendar
              mode="range"
              locale={es}
              selected={selected}
              onSelect={updateRange}
              defaultMonth={selected?.from}
              numberOfMonths={2}
              resetOnSelect
              aria-label="Seleccionar rango de fechas"
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}
