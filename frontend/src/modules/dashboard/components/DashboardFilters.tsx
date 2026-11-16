import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DashboardPeriod } from "../types/dashboard.types"

const PERIODS: { value: DashboardPeriod; label: string }[] = [
  { value: "week", label: "Semana" },
  { value: "month", label: "Mes" },
  { value: "year", label: "Año" },
]

interface DashboardFiltersProps {
  period: DashboardPeriod
  onPeriodChange: (period: DashboardPeriod) => void
  /** Etiqueta accesible del grupo de selección. */
  label?: string
}

export default function DashboardFilters({
  period,
  onPeriodChange,
  label = "Seleccionar período",
}: DashboardFiltersProps) {
  return (
    <div className="flex flex-wrap gap-1" role="group" aria-label={label}>
      {PERIODS.map(({ value, label: periodLabel }) => {
        const active = period === value
        return (
          <Button
            key={value}
            type="button"
            size="sm"
            variant={active ? "default" : "outline"}
            aria-pressed={active}
            onClick={() => onPeriodChange(value)}
            className={cn(active && "bg-green-600 text-white hover:bg-green-700")}
          >
            {periodLabel}
          </Button>
        )
      })}
    </div>
  )
}
