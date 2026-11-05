import { useCallback, useLayoutEffect, useRef } from "react"
import { CalendarArrowDown, CheckCircle2Icon, CircleIcon, Clock3Icon, LoaderCircleIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  useWeeklyStatistics,
  type WeeklyCalendarDay,
  type WeeklyCalendarWeek,
} from "../../hooks/useWeeklyStatistics"

const LOAD_THRESHOLD = 80
const MAX_PREFILL_WEEKS = 12

function DayCell({ day, onSelect }: { day: WeeklyCalendarDay; onSelect?: () => void }) {
  const isCompleted = day.status === "completed"
  const isToday = day.isToday
  const interactive = Boolean(onSelect)

  const Icon = isCompleted ? CheckCircle2Icon : isToday ? Clock3Icon : CircleIcon

  const className = cn(
    "flex min-w-32 flex-col items-center justify-center gap-1 rounded-lg border p-4 text-center",
    isToday ? "border-green-600 bg-green-400/10" : "border-border/60 bg-muted/20",
    interactive && "cursor-pointer transition-colors hover:border-green-600/60 hover:bg-accent",
  )

  const label = `${day.weekdayLabel} ${day.dateLabel}: ${day.statusLabel}`

  const content = (
    <>
      <span className="text-xs font-medium capitalize text-muted-foreground">{day.weekdayLabel}</span>
      <span className="text-sm font-medium tabular-nums">{day.dateLabel}</span>
      <Icon
        aria-hidden="true"
        className={cn(
          "size-5",
          isCompleted ? "text-emerald-600 dark:text-emerald-400" : isToday ? "text-primary" : "text-muted-foreground/40",
        )}
      />
      <span
        className={cn(
          "text-[11px] leading-none",
          isCompleted
            ? "text-emerald-700 dark:text-emerald-400"
            : isToday
              ? "font-semibold text-primary"
              : "text-muted-foreground",
        )}
      >
        {day.statusLabel}
      </span>
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        aria-label={label}
        aria-current={isToday ? "date" : undefined}
        onClick={onSelect}
        className={className}
      >
        {content}
      </button>
    )
  }

  return (
    <section aria-label={label} aria-current={isToday ? "date" : undefined} className={className}>
      {content}
    </section>
  )
}

function WeekGroup({
  week,
  onSelectDay,
  isDayInteractive,
}: {
  week: WeeklyCalendarWeek
  onSelectDay: (day: WeeklyCalendarDay) => void
  isDayInteractive: (day: WeeklyCalendarDay) => boolean
}) {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <span className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
        {week.rangeLabel}
      </span>
      <div className="flex gap-1.5">
        {week.days.map((day) => (
          <DayCell
            key={day.dateKey}
            day={day}
            onSelect={isDayInteractive(day) ? () => onSelectDay(day) : undefined}
          />
        ))}
      </div>
    </div>
  )
}

function WeekSkeleton() {
  return (
    <div className="flex shrink-0 flex-col gap-1.5">
      <Skeleton className="h-3 w-20" />
      <div className="flex gap-1.5">
        {Array.from({ length: 7 }, (_, index) => (
          <Skeleton key={index} className="min-w-16 rounded-lg" style={{ height: 84 }} />
        ))}
      </div>
    </div>
  )
}

interface WeeklyCalendarProps {
  accommodationId: string
  /** Abre el formulario de nueva carga para un día sin estadística. */
  onCreateForDate?: (dateKey: string) => void
  /** Navega al detalle de una estadística cargada. */
  onViewRecord?: (recordId: string) => void
}

export default function WeeklyCalendar({
  accommodationId,
  onCreateForDate,
  onViewRecord,
}: WeeklyCalendarProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const pendingRestoreRef = useRef<{ scrollWidth: number; scrollLeft: number } | null>(null)

  const { weeks, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError, refetch } =
    useWeeklyStatistics(accommodationId)

  const handleSelectDay = useCallback(
    (day: WeeklyCalendarDay) => {
      if (day.status === "completed" && day.recordId) {
        onViewRecord?.(day.recordId)
      } else {
        onCreateForDate?.(day.dateKey)
      }
    },
    [onCreateForDate, onViewRecord],
  )

  const isDayInteractive = useCallback(
    (day: WeeklyCalendarDay) => (day.status === "completed" ? Boolean(onViewRecord) : Boolean(onCreateForDate)),
    [onCreateForDate, onViewRecord],
  )

  const scrollToCurrentWeek = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const target = el.scrollWidth
    if (typeof el.scrollTo === "function") {
      el.scrollTo({ left: target, behavior: "smooth" })
    } else {
      el.scrollLeft = target
    }
  }, [])

  const loadOlderWeek = useCallback(() => {
    const el = scrollRef.current
    if (el) {
      pendingRestoreRef.current = { scrollWidth: el.scrollWidth, scrollLeft: el.scrollLeft }
    }
    fetchNextPage()
  }, [fetchNextPage])

  // Ancla la vista a la semana actual (a la derecha) y, si el contenido aún no
  // desborda, precarga semanas anteriores para que exista scroll horizontal.
  // Al anteponer semanas desde el scroll del usuario, restaura la posición.
  useLayoutEffect(() => {
    const el = scrollRef.current
    if (!el || weeks.length === 0) return

    const pending = pendingRestoreRef.current
    if (pending) {
      el.scrollLeft = el.scrollWidth - pending.scrollWidth + pending.scrollLeft
      pendingRestoreRef.current = null
    } else {
      el.scrollLeft = el.scrollWidth
    }

    if (
      el.clientWidth > 0 &&
      weeks.length < MAX_PREFILL_WEEKS &&
      el.scrollWidth <= el.clientWidth &&
      hasNextPage &&
      !isFetchingNextPage
    ) {
      fetchNextPage()
    }
  }, [weeks.length, hasNextPage, isFetchingNextPage, fetchNextPage])

  // Si falla la carga de una semana anterior, libera el estado pendiente
  // para que el scroll pueda volver a intentarlo.
  useLayoutEffect(() => {
    if (isError) {
      pendingRestoreRef.current = null
    }
  }, [isError])

  const handleScroll = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    if (el.scrollLeft <= LOAD_THRESHOLD && hasNextPage && !isFetchingNextPage && !pendingRestoreRef.current) {
      loadOlderWeek()
    }
  }, [hasNextPage, isFetchingNextPage, loadOlderWeek])

  const orderedWeeks = [...weeks].reverse()

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs text-muted-foreground">
          Desplazate hacia la izquierda para ver semanas anteriores.
        </span>
        <Button variant="outline" size="sm" onClick={scrollToCurrentWeek}>
          Esta semana
          <CalendarArrowDown className="size-4 ml-2" aria-hidden="true" />
        </Button>
      </div>

      <div
        ref={scrollRef}
        onScroll={handleScroll}
        role="region"
        aria-label="Calendario semanal de carga"
        tabIndex={0}
        className="subtle-scrollbar overflow-x-auto pb-2 outline-none"
      >
        {isLoading ? (
          <WeekSkeleton />
        ) : isError && weeks.length === 0 ? (
          <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
            <p className="text-sm text-destructive">No se pudo cargar el estado semanal.</p>
            <Button variant="outline" size="sm" onClick={() => void refetch()}>
              Reintentar
            </Button>
          </div>
        ) : (
          <div className="flex min-w-full w-max justify-end gap-6">
            {isFetchingNextPage && (
              <div className="flex shrink-0 items-center self-center pl-2" role="status" aria-label="Cargando semanas anteriores">
                <LoaderCircleIcon className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
              </div>
            )}
            {isError && weeks.length > 0 && (
              <div role="alert" className="flex shrink-0 flex-col items-center justify-center gap-2 self-center px-4 text-center">
                <p className="text-xs text-destructive">No se pudo cargar la semana anterior.</p>
                <Button variant="outline" size="sm" onClick={() => void loadOlderWeek()}>
                  Reintentar
                </Button>
              </div>
            )}
            {orderedWeeks.map((week) => (
              <WeekGroup
                key={week.key}
                week={week}
                onSelectDay={handleSelectDay}
                isDayInteractive={isDayInteractive}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
