import { useMemo, useState } from "react"
import { format, subDays } from "date-fns"
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { getVisibleModules } from "@/lib/modules"
import { useMyOrganizationMemberships } from "@/modules/organizations/hooks/useMyOrganizationMemberships"
import { accommodationStatisticsApi } from "@/modules/accommodations/api/accommodation-statistics.api"
import { accommodationsApi } from "@/modules/accommodations/api/accommodations.api"
import type { Accommodation } from "@/modules/accommodations/types/accommodation.types"
import type {
  AccommodationDailyStatistic,
  AllAccommodationsStatisticsSummary,
} from "@/modules/accommodations/types/accommodation-statistics.types"
import type { DashboardDateRange, MinistryPeriod } from "../types/dashboard.types"
import {
  accommodationDisplayName,
  buildComparison,
  buildDailyEvolution,
  buildLatestRecords,
  buildOriginDistribution,
  buildPurposeDistribution,
  computeLoadAlerts,
  getMinistryPeriodRange,
  getPreviousPeriodRange,
} from "../utils/dashboard.utils"

const DATE_KEY = "yyyy-MM-dd"
const ALERT_THRESHOLD_DAYS = 7
const ALERT_WINDOW_DAYS = 30

const EMPTY_ACCOMMODATIONS: Accommodation[] = []
const EMPTY_RECORDS: AccommodationDailyStatistic[] = []

function toDateKey(date: Date): string {
  return format(date, DATE_KEY)
}

function isDateRangeValid(range: DashboardDateRange): boolean {
  return Boolean(range.from) && Boolean(range.to) && range.from <= range.to
}

/**
 * Estado de la vista global del Ministerio: resumen agregado de todos los
 * alojamientos, comparación entre períodos y detalle por alojamiento
 * (evolución, últimos registros y alertas de carga).
 */
export function useMinistryDashboard(isSystemRole = false) {
  const { user } = useAuth()
  const memberships = useMyOrganizationMemberships(user?.id)
  const hasStatisticsAccess = memberships.length > 0 || isSystemRole

  const [period, setPeriod] = useState<MinistryPeriod>("7d")
  const [customRange, setCustomRange] = useState<DashboardDateRange | null>(null)
  const [now] = useState(() => new Date())
  const todayKey = toDateKey(now)
  const range: DashboardDateRange =
    period === "custom"
      ? customRange ?? { from: "", to: "" }
      : getMinistryPeriodRange(period, now)
  const previousRange = isDateRangeValid(range) ? getPreviousPeriodRange(range) : { from: "", to: "" }

  const accommodationsQuery = useQuery({
    queryKey: ["ministry-accommodations"],
    queryFn: () => accommodationsApi.list(),
  })
  const accommodations = accommodationsQuery.data ?? EMPTY_ACCOMMODATIONS
  const activeAccommodations = useMemo(
    () => accommodations.filter((accommodation) => accommodation.isActive),
    [accommodations],
  )
  const accommodationNameById = useMemo(
    () => new Map(accommodations.map((acc) => [acc.id, accommodationDisplayName(acc)])),
    [accommodations],
  )

  const summaryQuery = useQuery<AllAccommodationsStatisticsSummary>({
    queryKey: ["ministry-all-summary", range.from, range.to],
    queryFn: () => accommodationStatisticsApi.getAllSummary(range.from, range.to),
    enabled: isDateRangeValid(range),
    retry: false,
  })
  const previousQuery = useQuery<AllAccommodationsStatisticsSummary>({
    queryKey: ["ministry-all-summary", previousRange.from, previousRange.to],
    queryFn: () => accommodationStatisticsApi.getAllSummary(previousRange.from, previousRange.to),
    enabled: isDateRangeValid(previousRange),
    retry: false,
  })

  // Ventana unificada para el detalle por alojamiento: cubre el período
  // seleccionado y, como mínimo, los últimos 30 días (para las alertas).
  const alertWindowFrom = toDateKey(subDays(now, ALERT_WINDOW_DAYS - 1))
  const unifiedFrom = range.from && range.from < alertWindowFrom ? range.from : alertWindowFrom
  const unifiedTo = range.to || todayKey

  const recordsQuery = useQuery<AccommodationDailyStatistic[]>({
    queryKey: [
      "ministry-accommodation-records",
      unifiedFrom,
      unifiedTo,
      activeAccommodations.map((acc) => acc.id).join(","),
    ],
    queryFn: async () => {
      const results = await Promise.allSettled(
        activeAccommodations.map((acc) =>
          accommodationStatisticsApi.listByAccommodation(acc.id, unifiedFrom, unifiedTo),
        ),
      )
      return results.flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    },
    enabled: activeAccommodations.length > 0 && Boolean(unifiedFrom) && Boolean(unifiedTo),
    retry: false,
  })
  const allRecords = recordsQuery.data ?? EMPTY_RECORDS

  // Última fecha de carga por alojamiento dentro de la ventana de alertas.
  const latestLoadDates = useMemo(() => {
    const map = new Map<string, string | null>(
      activeAccommodations.map((acc) => [acc.id, null]),
    )
    for (const record of allRecords) {
      const dateKey = record.date.slice(0, 10)
      const current = map.get(record.accommodationId)
      if (!current || dateKey > current) map.set(record.accommodationId, dateKey)
    }
    return map
  }, [allRecords, activeAccommodations])

  const recordsInRange = useMemo(
    () =>
      allRecords.filter(
        (record) =>
          record.date.slice(0, 10) >= range.from && record.date.slice(0, 10) <= range.to,
      ),
    [allRecords, range.from, range.to],
  )

  const summary = summaryQuery.data ?? null
  const previousSummary = previousQuery.data ?? null

  const alojamientosActivos = activeAccommodations.length
  const loadedAccommodations = summary?.accomodationsCount ?? 0
  const pendingAccommodations = Math.max(0, alojamientosActivos - loadedAccommodations)

  const dailyEvolution = useMemo(() => buildDailyEvolution(recordsInRange), [recordsInRange])
  const motives = useMemo(() => buildPurposeDistribution(summary), [summary])
  const origins = useMemo(() => buildOriginDistribution(summary), [summary])
  const comparison = useMemo(
    () => buildComparison(summary?.totalGuests ?? 0, previousSummary?.totalGuests ?? 0),
    [summary, previousSummary],
  )
  const latestRecords = useMemo(
    () => buildLatestRecords(recordsInRange, accommodationNameById),
    [recordsInRange, accommodationNameById],
  )
  const alerts = useMemo(
    () =>
      computeLoadAlerts(
        activeAccommodations.map((acc) => ({ id: acc.id, name: accommodationDisplayName(acc) })),
        latestLoadDates,
        now,
        ALERT_THRESHOLD_DAYS,
      ),
    [activeAccommodations, latestLoadDates, now],
  )

  const loading = accommodationsQuery.isLoading || summaryQuery.isLoading
  const error =
    (accommodationsQuery.isError && "No se pudieron cargar los alojamientos.") ||
    (summaryQuery.isError && "No se pudo cargar el resumen global de estadísticas.") ||
    null

  const reload = () => {
    void summaryQuery.refetch()
    void previousQuery.refetch()
    void recordsQuery.refetch()
    void accommodationsQuery.refetch()
  }

  const modules = getVisibleModules(user, hasStatisticsAccess)

  return {
    period,
    setPeriod,
    customRange,
    setCustomRange,
    range,
    loading,
    error,
    reload,
    summary,
    visitantes: summary?.totalGuests ?? 0,
    cargasRegistradas: summary?.totalRecords ?? 0,
    alojamientosActivos,
    loadStatus: {
      total: alojamientosActivos,
      loaded: loadedAccommodations,
      pending: pendingAccommodations,
    },
    dailyEvolution,
    motives,
    origins,
    comparison,
    latestRecords,
    alerts,
    modules,
  }
}
