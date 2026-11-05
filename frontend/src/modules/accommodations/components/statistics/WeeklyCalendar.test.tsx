import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { QueryClientProvider } from "@tanstack/react-query"
import { format } from "date-fns"
import { createTestQueryClient } from "@/test/query-client"
import { accommodationStatisticsApi } from "../../api/accommodation-statistics.api"
import type { AccommodationDailyStatistic } from "../../types/accommodation-statistics.types"
import WeeklyCalendar from "./WeeklyCalendar"

vi.mock("../../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: { listByAccommodation: vi.fn() },
}))

interface RenderProps {
  onCreateForDate?: (dateKey: string) => void
  onViewRecord?: (recordId: string) => void
}

function renderCalendar(props: RenderProps = {}) {
  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <WeeklyCalendar accommodationId="stay-1" {...props} />
    </QueryClientProvider>,
  )
}

describe("WeeklyCalendar", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([])
  })

  afterEach(cleanup)

  it("renders the current week's seven days with day name, date, icon and status", async () => {
    renderCalendar()

    expect(await screen.findByRole("button", { name: "Esta semana" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Calendario semanal de carga" })).toBeInTheDocument()

    const cells = await screen.findAllByLabelText(/:\s(Cargado|Hoy|Pendiente)$/)
    expect(cells).toHaveLength(7)
    expect(screen.getAllByText("Pendiente")).toHaveLength(6)
    expect(screen.getByText("Hoy")).toBeInTheDocument()
    expect(document.querySelector('[aria-current="date"]')).toHaveTextContent("Hoy")
  })

  it("marks today as loaded (green) and keeps it visually distinct when it has a statistic", async () => {
    const todayKey = format(new Date(), "yyyy-MM-dd")
    const record: AccommodationDailyStatistic = {
      id: "r1",
      accommodationId: "stay-1",
      date: todayKey,
      totalGuests: 2,
      ageRanges: [],
      travelPurposes: [],
      origins: [],
    }
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([record])

    renderCalendar()

    await waitFor(() => expect(document.querySelector('[aria-current="date"]')).toBeInTheDocument())
    expect(document.querySelector('[aria-current="date"]')).toHaveTextContent("Cargado")
    expect(screen.getAllByText("Pendiente")).toHaveLength(6)
  })

  it("opens the create form for a pending day", async () => {
    const onCreateForDate = vi.fn()
    renderCalendar({ onCreateForDate })

    const pendingButtons = await screen.findAllByLabelText(/Pendiente$/)
    fireEvent.click(pendingButtons[0])

    expect(onCreateForDate).toHaveBeenCalledTimes(1)
    expect(onCreateForDate).toHaveBeenCalledWith(expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/))
  })

  it("opens the record detail for a completed day", async () => {
    const todayKey = format(new Date(), "yyyy-MM-dd")
    const record: AccommodationDailyStatistic = {
      id: "record-1",
      accommodationId: "stay-1",
      date: todayKey,
      totalGuests: 2,
      ageRanges: [],
      travelPurposes: [],
      origins: [],
    }
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([record])
    const onViewRecord = vi.fn()
    renderCalendar({ onViewRecord })

    const completedButton = await screen.findByLabelText(/Cargado$/)
    fireEvent.click(completedButton)

    expect(onViewRecord).toHaveBeenCalledWith("record-1")
  })
})
