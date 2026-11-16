import { differenceInCalendarDays, format, parseISO, startOfMonth, startOfWeek, subDays } from "date-fns"
import { es } from "date-fns/locale"
import {
  originTypeLabels,
  purposeLabels,
} from "@/modules/accommodations/constants/accommodation-statistics-labels"
import type { Accommodation } from "@/modules/accommodations/types/accommodation.types"
import type {
  AccommodationDailyStatistic,
  AccommodationStatisticsSummary,
} from "@/modules/accommodations/types/accommodation-statistics.types"
import type {
  DailyGuestPoint,
  DashboardDateRange,
  DashboardVariant,
  LatestRecord,
  LoadAlert,
  MinistryPeriod,
  OriginSlice,
  PeriodComparison,
  PurposeSlice,
  WeeklyGuestPoint,
} from "../types/dashboard.types"

const DATE_KEY = "yyyy-MM-dd"

/**
 * Nombre visible de un alojamiento: organización + localidad, cuando existe.
 */
export function accommodationDisplayName(accommodation: Accommodation): string {
  const locality = accommodation.locality ? ` — ${accommodation.locality}` : ""
  return `${accommodation.organization.name}${locality}`
}

/**
 * Resuelve la variante de dashboard según el rol efectivo del usuario.
 *
 * Reglas:
 * - Un rol de sistema (`isSystemRole`) siempre ve la vista de Ministerio.
 * - Cualquier membresía OWNER o ADMIN ve la vista de establecimiento.
 * - Una membresía OPERATOR ve la vista operativa.
 * - Sin membresía ni rol de sistema, se conserva la vista de Ministerio
 *   (módulos y métricas que habilite el perfil).
 */
export function resolveDashboardVariant(
  isSystemRole: boolean,
  memberships: ReadonlyArray<{ role: string }>,
): DashboardVariant {
  if (isSystemRole) return "ministry"

  const roles = memberships.map((membership) => membership.role)
  if (roles.some((role) => role === "OWNER" || role === "ADMIN")) return "owner"
  if (roles.some((role) => role === "OPERATOR")) return "operator"

  return "ministry"
}

/**
 * Convierte los motivos del viaje del resumen en porciones etiquetadas para el
 * gráfico de torta. Los motivos sin cantidad se omiten.
 */
export function buildPurposeDistribution(
  summary: AccommodationStatisticsSummary | null,
): PurposeSlice[] {
  if (!summary) return []
  return summary.travelPurposes
    .filter(({ quantity }) => quantity > 0)
    .map(({ purpose, quantity }) => ({
      name: purposeLabels[purpose] ?? purpose,
      quantity,
    }))
}

/**
 * Construye la evolución diaria de huéspedes ordenando los registros por fecha.
 */
export function buildDailyEvolution(
  records: AccommodationDailyStatistic[],
): DailyGuestPoint[] {
  return [...records]
    .sort((left, right) => left.date.slice(0, 10).localeCompare(right.date.slice(0, 10)))
    .map((record) => ({
      label: format(parseISO(record.date.slice(0, 10)), "d MMM", { locale: es }),
      guests: record.totalGuests,
    }))
}

/**
 * Agrupa los registros diarios en totales semanales (lunes a domingo),
 * ordenados por semana. Cada punto usa como etiqueta la fecha de inicio de la
 * semana.
 */
export function buildWeeklyGuests(
  records: AccommodationDailyStatistic[],
): WeeklyGuestPoint[] {
  const byWeek = new Map<string, { start: Date; guests: number }>()

  for (const record of records) {
    const date = parseISO(record.date.slice(0, 10))
    const weekStart = startOfWeek(date, { weekStartsOn: 1 })
    const key = format(weekStart, "yyyy-MM-dd")
    const current = byWeek.get(key) ?? { start: weekStart, guests: 0 }
    current.guests += record.totalGuests
    byWeek.set(key, current)
  }

  return [...byWeek.values()]
    .sort((left, right) => left.start.getTime() - right.start.getTime())
    .map(({ start, guests }) => ({
      label: format(start, "d MMM", { locale: es }),
      guests,
    }))
}

/**
 * Cuenta los lugares de origen distintos (provincias o países) del resumen.
 * Ignora diferencias de mayúsculas/espacios y valores vacíos.
 */
export function countDistinctOrigins(
  summary: AccommodationStatisticsSummary | null,
): number {
  if (!summary) return 0
  const names = new Set<string>()
  for (const origin of summary.origins) {
    const normalized = origin.name.trim().toLocaleLowerCase()
    if (normalized) names.add(normalized)
  }
  return names.size
}

/**
 * Rango de fechas para los períodos rápidos del dashboard de Ministerio.
 * `7d`/`30d` son ventanas hacia atrás desde hoy; `month` es el mes corriente.
 */
export function getMinistryPeriodRange(
  period: Exclude<MinistryPeriod, "custom">,
  today = new Date(),
): DashboardDateRange {
  if (period === "month") {
    return {
      from: format(startOfMonth(today), DATE_KEY),
      to: format(today, DATE_KEY),
    }
  }
  const days = period === "30d" ? 30 : 7
  return {
    from: format(subDays(today, days - 1), DATE_KEY),
    to: format(today, DATE_KEY),
  }
}

/**
 * Período inmediatamente anterior al rango dado, con la misma duración.
 * Útil para la comparación entre períodos.
 */
export function getPreviousPeriodRange(range: DashboardDateRange): DashboardDateRange {
  const from = parseISO(range.from)
  const to = parseISO(range.to)
  const duration = differenceInCalendarDays(to, from)
  const prevTo = subDays(from, 1)
  const prevFrom = subDays(prevTo, duration)
  return { from: format(prevFrom, DATE_KEY), to: format(prevTo, DATE_KEY) }
}

/**
 * Ordena los registros por fecha descendente y resuelve el nombre del
 * alojamiento para los más recientes.
 */
export function buildLatestRecords(
  records: AccommodationDailyStatistic[],
  accommodationNameById: ReadonlyMap<string, string>,
  limit = 5,
): LatestRecord[] {
  return [...records]
    .sort((left, right) => right.date.slice(0, 10).localeCompare(left.date.slice(0, 10)))
    .slice(0, limit)
    .map((record) => ({
      id: record.id,
      accommodationId: record.accommodationId,
      accommodationName: accommodationNameById.get(record.accommodationId) ?? record.accommodationId,
      date: record.date,
      totalGuests: record.totalGuests,
    }))
}

/**
 * Alojamientos activos que llevan `thresholdDays` o más sin cargar (o que
 * nunca cargaron). Ordenados del más crítico (nunca cargó) al menos crítico.
 */
export function computeLoadAlerts(
  activeAccommodations: ReadonlyArray<{ id: string; name: string }>,
  latestLoadDates: ReadonlyMap<string, string | null>,
  now: Date,
  thresholdDays: number,
): LoadAlert[] {
  const alerts: LoadAlert[] = []

  for (const accommodation of activeAccommodations) {
    const latest = latestLoadDates.get(accommodation.id)
    let daysSinceLoad: number | null
    if (latest) {
      daysSinceLoad = differenceInCalendarDays(now, parseISO(latest))
      if (daysSinceLoad < thresholdDays) continue
    } else {
      daysSinceLoad = null
    }
    alerts.push({
      accommodationId: accommodation.id,
      accommodationName: accommodation.name,
      daysSinceLoad,
    })
  }

  return alerts.sort((left, right) => {
    const lv = left.daysSinceLoad === null ? Number.POSITIVE_INFINITY : left.daysSinceLoad
    const rv = right.daysSinceLoad === null ? Number.POSITIVE_INFINITY : right.daysSinceLoad
    return rv - lv
  })
}

/**
 * Convierte la procedencia del resumen en porciones etiquetadas.
 */
export function buildOriginDistribution(
  summary: AccommodationStatisticsSummary | null,
): OriginSlice[] {
  if (!summary) return []
  return summary.origins.map((origin) => ({
    name: origin.name,
    type: originTypeLabels[origin.type] ?? origin.type,
    quantity: origin.quantity,
  }))
}

/**
 * Compara el total de visitantes entre el período actual y el anterior.
 */
export function buildComparison(current: number, previous: number): PeriodComparison {
  const delta = current - previous
  const deltaPercent = previous === 0 ? null : Math.round((delta / previous) * 100)
  return { current, previous, delta, deltaPercent }
}
