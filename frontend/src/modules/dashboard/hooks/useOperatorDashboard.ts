import { useMemo, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { accommodationStatisticsApi } from "@/modules/accommodations/api/accommodation-statistics.api"
import { useAccommodationStatistics } from "@/modules/accommodations/hooks/useAccommodationStatistics"
import { countDistinctOrigins } from "../utils/dashboard.utils"

/**
 * Estado de la vista Operador: métricas del mes corriente para el alojamiento
 * seleccionado, sin selector de período (siempre mes).
 */
export function useOperatorDashboard() {
  const [selectedId, setSelectedId] = useState("")

  const accommodationsQuery = useQuery({
    queryKey: ["member-accommodations"],
    queryFn: () => accommodationStatisticsApi.listMemberAccommodations(),
  })

  const accommodations = accommodationsQuery.data ?? []
  const selectedAccommodation =
    accommodations.find((item) => item.id === selectedId) ?? accommodations[0] ?? null
  const accommodationId = selectedAccommodation?.id ?? ""

  const statistics = useAccommodationStatistics(accommodationId)

  const daysWithLoad = statistics.records.length
  const visitorsInMonth = statistics.summary?.totalGuests ?? 0
  const originPlaces = useMemo(
    () => countDistinctOrigins(statistics.summary),
    [statistics.summary],
  )

  return {
    accommodations,
    selectedAccommodation,
    setSelectedId,
    summary: statistics.summary,
    records: statistics.records,
    loading: accommodationsQuery.isLoading || (accommodationId !== "" && statistics.loading),
    error: statistics.error,
    reload: statistics.reload,
    daysWithLoad,
    visitorsInMonth,
    originPlaces,
  }
}
