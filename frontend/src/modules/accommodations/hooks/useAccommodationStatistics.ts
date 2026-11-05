import { useCallback, useEffect, useRef, useState } from "react"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { AccommodationDailyStatistic, AccommodationStatisticsSummary } from "../types/accommodation-statistics.types"

function getCurrentMonthRange() {
  const today = new Date()
  const toDateInputValue = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    return `${year}-${month}-${day}`
  }
  return {
    from: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInputValue(today),
  }
}

export function useAccommodationStatistics(accommodationId: string, initialRange?: { from: string; to: string }) {
  const [range, setRange] = useState(() => initialRange ?? getCurrentMonthRange())
  const [summary, setSummary] = useState<AccommodationStatisticsSummary | null>(null)
  const [records, setRecords] = useState<AccommodationDailyStatistic[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const requestId = useRef(0)

  const requestStatistics = useCallback(() => Promise.all([
        accommodationStatisticsApi.getSummary(accommodationId, range.from, range.to),
        accommodationStatisticsApi.listByAccommodation(accommodationId, range.from, range.to),
      ]), [accommodationId, range.from, range.to])

  useEffect(() => {
    if (!accommodationId || !range.from || !range.to || range.from > range.to) return
    const currentRequestId = ++requestId.current
    requestStatistics().then(([nextSummary, nextRecords]) => {
      if (currentRequestId !== requestId.current) return
      setSummary(nextSummary)
      setRecords(nextRecords)
    }).catch(() => {
      if (currentRequestId === requestId.current) setError("No se pudieron cargar las estadísticas. Verifica tu acceso e inténtalo nuevamente.")
    }).finally(() => {
      if (currentRequestId === requestId.current) setLoading(false)
    })
    return () => { requestId.current += 1 }
  }, [accommodationId, range.from, range.to, requestStatistics])

  const updateRange = useCallback((nextRange: typeof range) => {
    setLoading(true)
    setSummary(null)
    setRecords([])
    setError(null)
    setRange(nextRange)
  }, [])

  const reload = useCallback(() => {
    setLoading(true)
    setError(null)
    const currentRequestId = ++requestId.current
    requestStatistics().then(([nextSummary, nextRecords]) => {
      if (currentRequestId !== requestId.current) return
      setSummary(nextSummary)
      setRecords(nextRecords)
    }).catch(() => {
      if (currentRequestId === requestId.current) setError("No se pudieron cargar las estadísticas. Verifica tu acceso e inténtalo nuevamente.")
    }).finally(() => {
      if (currentRequestId === requestId.current) setLoading(false)
    })
  }, [requestStatistics])

  return { range, setRange: updateRange, summary, records, loading, error, reload }
}
