import {
  Building2Icon,
  CalendarDaysIcon,
  ChartNoAxesColumnIncreasingIcon,
  Globe2Icon,
  Users2Icon,
  type LucideIcon,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import type { StatCardData, StatCardIcon } from "../types/dashboard.types"

const ICONS: Record<StatCardIcon, LucideIcon> = {
  users: Users2Icon,
  calendar: CalendarDaysIcon,
  globe: Globe2Icon,
  building: Building2Icon,
  chart: ChartNoAxesColumnIncreasingIcon,
}

export default function StatCard({ label, value, description, icon }: StatCardData) {
  const Icon = icon ? ICONS[icon] : undefined

  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 pt-5">
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight tabular-nums">
            {value}
          </p>
          {description && (
            <p className="mt-1 text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {Icon && (
          <span
            className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
            aria-hidden="true"
          >
            <Icon className="size-5" />
          </span>
        )}
      </CardContent>
    </Card>
  )
}
