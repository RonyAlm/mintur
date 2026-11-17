import { CalendarCheckIcon, CheckCircle2Icon, CircleDashedIcon, CircleDotIcon } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { useWeeklyStatistics } from "@/modules/accommodations/hooks/useWeeklyStatistics"

interface WeeklyLoadStatusProps {
  accommodationId: string
}

/**
 * Estado de carga semanal de los últimos siete días.
 *
 * Estados:
 * - Verde: estadística cargada (`completed`).
 * - Gris: pendiente (`pending`).
 * - Azul: día actual (`today`).
 */
export default function WeeklyLoadStatus({ accommodationId }: WeeklyLoadStatusProps) {
  const { weeks, isLoading, isError } = useWeeklyStatistics(accommodationId)
  const week = weeks[0]

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-4">
        <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
          <CalendarCheckIcon className="text-green-600 size-4" />
        </div>
        <CardTitle>Estado de carga semanal</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-7 gap-2" role="status" aria-label="Cargando estado semanal">
            {Array.from({ length: 7 }, (_, index) => (
              <Skeleton key={index} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : isError && !week ? (
          <p role="alert" className="py-8 text-center text-sm text-destructive">
            No se pudo cargar el estado semanal.
          </p>
        ) : week ? (
          <>
            <div className="grid grid-cols-7 gap-2">
              {week.days.map((day) => {
                const completed = day.status === "completed"
                const today = day.status === "today"
                const Icon = completed ? CheckCircle2Icon : today ? CircleDotIcon : CircleDashedIcon
                return (
                  <div
                    key={day.dateKey}
                    className={cn(
                      "flex min-w-0 flex-col items-center justify-center gap-1 rounded-lg border p-3 text-center",
                      completed && "border-emerald-500/50 bg-emerald-50 dark:bg-emerald-950/40",
                      today && "border-blue-500/60 bg-blue-50 dark:bg-blue-950/40",
                      !completed && !today && "border-border/60 bg-muted/30",
                    )}
                  >
                    <span className="text-xs font-medium capitalize text-muted-foreground">
                      {day.weekdayLabel}
                    </span>
                    <span className="text-sm font-medium tabular-nums">{day.dateLabel}</span>
                    <Icon
                      aria-hidden="true"
                      className={cn(
                        "size-5",
                        completed
                          ? "text-emerald-600 dark:text-emerald-400"
                          : today
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-muted-foreground/40",
                      )}
                    />
                    <span
                      className={cn(
                        "text-[11px] leading-none",
                        completed
                          ? "text-emerald-700 dark:text-emerald-400"
                          : today
                            ? "font-semibold text-blue-700 dark:text-blue-300"
                            : "text-muted-foreground",
                      )}
                    >
                      {day.statusLabel}
                    </span>
                  </div>
                )
              })}
            </div>
            <ul className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-muted-foreground">
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                Cargada
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                Pendiente
              </li>
              <li className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500" aria-hidden="true" />
                Día actual
              </li>
            </ul>
          </>
        ) : null}
      </CardContent>
    </Card>
  )
}
