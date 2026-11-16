import { format, parseISO, startOfWeek } from "date-fns"
import { es } from "date-fns/locale"
import { purposeLabels } from "@/modules/accommodations/constants/accommodation-statistics-labels"
import type { Accommodation } from "@/modules/accommodations/types/accommodation.types"
import type {
  AccommodationDailyStatistic,
  AccommodationStatisticsSummary,
} from "@/modules/accommodations/types/accommodation-statistics.types"
import type {
  DailyGuestPoint,
  DashboardVariant,
  PurposeSlice,
  WeeklyGuestPoint,
} from "../types/dashboard.types"

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
