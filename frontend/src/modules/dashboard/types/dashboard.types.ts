import type { AccommodationDailyStatistic } from "@/modules/accommodations/types/accommodation-statistics.types"

/** Variante de dashboard según el rol efectivo del usuario. */
export type DashboardVariant = "ministry" | "owner" | "operator"

/** Períodos rápidos disponibles en el selector del dashboard (owner). */
export type DashboardPeriod = "week" | "month" | "year"

/** Períodos del dashboard de Ministerio. */
export type MinistryPeriod = "7d" | "30d" | "month" | "custom"

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

/** Una porción de la procedencia de visitantes. */
export interface OriginSlice {
  name: string
  type: string
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

/** Un registro reciente con el nombre del alojamiento resuelto. */
export interface LatestRecord {
  id: string
  accommodationId: string
  accommodationName: string
  date: string
  totalGuests: number
}

/** Alerta de un alojamiento que lleva días sin cargar estadísticas. */
export interface LoadAlert {
  accommodationId: string
  accommodationName: string
  /** Días sin cargar desde el último registro, o `null` si nunca cargó. */
  daysSinceLoad: number | null
}

/** Resumen del estado de carga global. */
export interface LoadStatusSummary {
  /** Alojamientos activos. */
  total: number
  /** Alojamientos con al menos un registro en el período. */
  loaded: number
  /** Alojamientos activos sin registros en el período. */
  pending: number
}

/** Comparación del total de visitantes entre dos períodos. */
export interface PeriodComparison {
  current: number
  previous: number
  /** Diferencia absoluta (`current - previous`). */
  delta: number
  /** Variación porcentual, o `null` cuando el período previo es 0. */
  deltaPercent: number | null
}

/** Registros crudos de un alojamiento (tipado reutilizado en merges). */
export type { AccommodationDailyStatistic }
