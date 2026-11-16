import type { AccommodationDailyStatistic, AccommodationStatisticsSummary } from "@/modules/accommodations/types/accommodation-statistics.types"

/** Variante de dashboard según el rol efectivo del usuario. */
export type DashboardVariant = "ministry" | "owner" | "operator"

/** Períodos rápidos disponibles en el selector del dashboard. */
export type DashboardPeriod = "week" | "month" | "year"

/** Rango de fechas en formato `yyyy-MM-dd` (mismo contrato que el backend). */
export interface DashboardDateRange {
  from: string
  to: string
}

/** Íconos admitidos por `StatCard`. */
export type StatCardIcon = "users" | "calendar" | "globe" | "building" | "chart"

/** Modelo de una tarjeta de indicador. */
export interface StatCardData {
  label: string
  value: string | number
  description?: string
  icon?: StatCardIcon
}

/** Una porción de la distribución por motivo del viaje. */
export interface PurposeSlice {
  name: string
  quantity: number
}

/** Un punto de la evolución diaria de huéspedes. */
export interface DailyGuestPoint {
  label: string
  guests: number
}

/** Total de huéspedes agrupado por semana. */
export interface WeeklyGuestPoint {
  label: string
  guests: number
}

/** Resultado del dashboard Owner: resumen + registros del período. */
export interface OwnerDashboardData {
  summary: AccommodationStatisticsSummary | null
  records: AccommodationDailyStatistic[]
}

/** Resultado del dashboard Operador: métricas mensuales. */
export interface OperatorDashboardData {
  summary: AccommodationStatisticsSummary | null
  records: AccommodationDailyStatistic[]
}
