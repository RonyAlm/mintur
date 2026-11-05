import { useEffect, useMemo, useState } from "react"
import { addDays, format, isSameDay, startOfWeek, subWeeks } from "date-fns"
import { es } from "date-fns/locale"
import { useInfiniteQuery } from "@tanstack/react-query"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { AccommodationDailyStatistic } from "../types/accommodation-statistics.types"

const DATE_KEY = "yyyy-MM-dd"

export type WeeklyCalendarDayStatus = "completed" | "today" | "pending"

export interface WeeklyCalendarDay {
  dateKey: string
  weekdayLabel: string
  dateLabel: string
  status: WeeklyCalendarDayStatus
  statusLabel: string
  isToday: boolean
  recordId?: string
}

export interface WeeklyCalendarWeek {
  key: string
  rangeLabel: string
  days: WeeklyCalendarDay[]
}

function toDateKey(date: Date): string {
  return format(date, DATE_KEY)
}

function statusLabelFor(status: WeeklyCalendarDayStatus): string {
  if (status === "completed") return "Cargado"
  if (status === "today") return "Hoy"
  return "Pendiente"
}

function buildDay(date: Date, records: AccommodationDailyStatistic[], now: Date): WeeklyCalendarDay {
  const dateKey = toDateKey(date)
  const record = records.find((item) => item.date.slice(0, 10) === dateKey)
  const isToday = isSameDay(date, now)
  const status: WeeklyCalendarDayStatus = record ? "completed" : isToday ? "today" : "pending"
  return {
    dateKey,
    weekdayLabel: format(date, "EEE", { locale: es }),
    dateLabel: format(date, "dd/MM"),
    status,
    statusLabel: statusLabelFor(status),
    isToday,
    recordId: record?.id,
  }
}

export function buildWeek(
  weekStart: Date,
  records: AccommodationDailyStatistic[],
  now: Date,
): WeeklyCalendarWeek {
  const weekEnd = addDays(weekStart, 6)
  return {
    key: toDateKey(weekStart),
    rangeLabel: `${format(weekStart, "d MMM", { locale: es })} – ${format(weekEnd, "d MMM", { locale: es })}`,
    days: Array.from({ length: 7 }, (_, index) => buildDay(addDays(weekStart, index), records, now)),
  }
}

/**
 * Carga las semanas de estadísticas de un alojamiento hacia atrás en el tiempo
 * usando `useInfiniteQuery`. La página 0 es la semana actual (lunes a domingo)
 * y cada página siguiente es una semana más antigua. No hay navegación hacia
 * el futuro: `getPreviousPageParam` siempre es `undefined`.
 */
export function useWeeklyStatistics(accommodationId: string) {
  const [now, setNow] = useState(() => new Date())

  // Actualiza automáticamente la semana cuando cambia la fecha (p. ej. medianoche).
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow((current) => {
        const next = new Date()
        return toDateKey(current) === toDateKey(next) ? current : next
      })
    }, 60_000)
    return () => window.clearInterval(intervalId)
  }, [])

  const currentWeekStart = useMemo(() => startOfWeek(now, { weekStartsOn: 1 }), [now])
  const currentWeekStartKey = toDateKey(currentWeekStart)

  const query = useInfiniteQuery({
    queryKey: ["accommodation-weekly-statistics", accommodationId, currentWeekStartKey],
    queryFn: ({ pageParam }) => {
      const weekStart = subWeeks(currentWeekStart, pageParam)
      const weekEnd = addDays(weekStart, 6)
      return accommodationStatisticsApi.listByAccommodation(
        accommodationId,
        toDateKey(weekStart),
        toDateKey(weekEnd),
      )
    },
    initialPageParam: 0,
    getNextPageParam: (_lastPage, allPages) => allPages.length,
    getPreviousPageParam: () => undefined,
  })

  const weeks = useMemo<WeeklyCalendarWeek[]>(() => {
    const pages = query.data?.pages ?? []
    return pages.map((records, pageIndex) => buildWeek(subWeeks(currentWeekStart, pageIndex), records, now))
  }, [query.data?.pages, currentWeekStart, now])

  return { ...query, weeks, currentWeekStartKey }
}
