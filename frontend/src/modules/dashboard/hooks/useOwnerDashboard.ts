import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { accommodationStatisticsApi } from "@/modules/accommodations/api/accommodation-statistics.api"
import { useAccommodationStatistics } from "@/modules/accommodations/hooks/useAccommodationStatistics"
import { getPeriodRange } from "@/modules/accommodations/utils/statisticsPeriods"
import type { DashboardPeriod } from "../types/dashboard.types"
import {
  buildDailyEvolution,
  buildPurposeDistribution,
  buildWeeklyGuests,
} from "../utils/dashboard.utils"

/**
 * Estado de la vista Owner/Admin: alojamientos del miembro, selección,
 * período, resumen y registros, y datos derivados para los gráficos.
 */
export function useOwnerDashboard() {
  const [period, setPeriod] = useState<DashboardPeriod>("month")
  const [selectedId, setSelectedId] = useState("")

  const accommodationsQuery = useQuery({
    queryKey: ["member-accommodations"],
    queryFn: () => accommodationStatisticsApi.listMemberAccommodations(),
  })

  const accommodations = accommodationsQuery.data ?? []
  const selectedAccommodation =
    accommodations.find((item) => item.id === selectedId) ?? accommodations[0] ?? null
  const accommodationId = selectedAccommodation?.id ?? ""

  const statistics = useAccommodationStatistics(accommodationId, getPeriodRange("month"))

  const daysWithLoad = statistics.records.length
  const purposeDistribution = useMemo(
    () => buildPurposeDistribution(statistics.summary),
    [statistics.summary],
  )
  const dailyEvolution = useMemo(
    () => buildDailyEvolution(statistics.records),
    [statistics.records],
  )
  const weeklyGuests = useMemo(
    () => buildWeeklyGuests(statistics.records),
    [statistics.records],
  )

  const changePeriod = (next: DashboardPeriod) => {
    setPeriod(next)
    statistics.setRange(getPeriodRange(next))
  }

  return {
    accommodations,
    selectedAccommodation,
    setSelectedId,
    period,
    changePeriod,
    summary: statistics.summary,
    records: statistics.records,
    loading: accommodationsQuery.isLoading || (accommodationId !== "" && statistics.loading),
    error: statistics.error,
    reload: statistics.reload,
    daysWithLoad,
    purposeDistribution,
    dailyEvolution,
    weeklyGuests,
  }
}
