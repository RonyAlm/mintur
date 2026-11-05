import { cleanup, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { addDays, format, startOfWeek, subWeeks } from "date-fns"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { createTestQueryClient } from "@/test/query-client"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { AccommodationDailyStatistic } from "../types/accommodation-statistics.types"
import { buildWeek, useWeeklyStatistics } from "./useWeeklyStatistics"

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: { listByAccommodation: vi.fn() },
}))

function wrapperWith(client: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

describe("buildWeek", () => {
  const monday = new Date(2026, 9, 26) // lunes 26/10/2026
  const now = new Date(2026, 9, 28) // miércoles 28/10/2026
  const record: AccommodationDailyStatistic = {
    id: "r1",
    accommodationId: "a",
    date: "2026-10-26",
    totalGuests: 3,
    ageRanges: [],
    travelPurposes: [],
    origins: [],
  }

  it("builds 7 days starting on Monday with the correct labels and statuses", () => {
    const week = buildWeek(monday, [record], now)

    expect(week.days).toHaveLength(7)
    expect(week.key).toBe("2026-10-26")
    expect(week.days[0]).toMatchObject({ dateKey: "2026-10-26", weekdayLabel: "lun", status: "completed" })
    expect(week.days[1]).toMatchObject({ dateKey: "2026-10-27", status: "pending" })
    expect(week.days[2]).toMatchObject({ dateKey: "2026-10-28", status: "today", isToday: true })
    expect(week.days[6].dateKey).toBe("2026-11-01")
    expect(week.days[6].weekdayLabel).toBe("dom")
  })
})

describe("useWeeklyStatistics", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([])
  })

  afterEach(cleanup)

  it("fetches the current week (Monday to Sunday) on mount", async () => {
    const client = createTestQueryClient()
    const { result } = renderHook(() => useWeeklyStatistics("stay-1"), { wrapper: wrapperWith(client) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.weeks).toHaveLength(1)
    expect(result.current.weeks[0].days).toHaveLength(7)
    expect(result.current.hasPreviousPage).toBe(false)

    const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
    expect(accommodationStatisticsApi.listByAccommodation).toHaveBeenCalledWith(
      "stay-1",
      format(monday, "yyyy-MM-dd"),
      format(addDays(monday, 6), "yyyy-MM-dd"),
    )
  })

  it("loads the previous week via fetchNextPage without navigating to the future", async () => {
    const client = createTestQueryClient()
    const listByAccommodation = vi.mocked(accommodationStatisticsApi.listByAccommodation)
    const { result } = renderHook(() => useWeeklyStatistics("stay-1"), { wrapper: wrapperWith(client) })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))
    expect(result.current.hasNextPage).toBe(true)

    result.current.fetchNextPage()

    await waitFor(() => expect(result.current.data?.pages).toHaveLength(2))

    const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
    const prevMonday = subWeeks(monday, 1)
    expect(listByAccommodation).toHaveBeenCalledWith(
      "stay-1",
      format(prevMonday, "yyyy-MM-dd"),
      format(addDays(prevMonday, 6), "yyyy-MM-dd"),
    )
    // No se puede navegar hacia el futuro.
    expect(result.current.hasPreviousPage).toBe(false)

    // La semana actual sigue cacheada: no se volvió a consultar al avanzar.
    const currentWeekCalls = listByAccommodation.mock.calls.filter(
      (call) => call[1] === format(monday, "yyyy-MM-dd"),
    )
    expect(currentWeekCalls).toHaveLength(1)
  })
})
