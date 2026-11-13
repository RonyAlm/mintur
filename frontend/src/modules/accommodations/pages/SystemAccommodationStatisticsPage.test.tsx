import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTestQueryClient } from "@/test/query-client"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import { accommodationsApi } from "../api/accommodations.api"
import { useStatisticsPermissions } from "../hooks/useStatisticsPermissions"
import type { Accommodation } from "../types/accommodation.types"
import { exportAccommodationStatisticsToPdf } from "../utils/exportStatisticsPdf"
import SystemAccommodationStatisticsPage from "./SystemAccommodationStatisticsPage"

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: {
    getAllSummary: vi.fn(),
    getSummary: vi.fn(),
    listByAccommodation: vi.fn(),
  },
}))

vi.mock("../api/accommodations.api", () => ({ accommodationsApi: { list: vi.fn() } }))
vi.mock("../hooks/useStatisticsPermissions", () => ({
  useStatisticsPermissions: vi.fn(),
}))
vi.mock("./AccommodationStatisticsPage", () => ({
  default: ({ accommodationId, view }: { accommodationId: string; view: string }) => (
    <div data-testid="accommodation-statistics-page">{accommodationId}:{view}</div>
  ),
}))
vi.mock("../components/statistics/AccommodationStatisticsReports", () => ({
  default: ({ summary }: { summary: { totalGuests: number; totalRecords: number } }) => (
    <div data-testid="global-summary">{summary.totalGuests}:{summary.totalRecords}</div>
  ),
}))
vi.mock("../utils/exportStatisticsPdf", () => ({
  exportAccommodationStatisticsToPdf: vi.fn(),
}))

const accommodation = {
  id: "accommodation-1",
  organizationId: "organization-1",
  type: "HOTEL",
  isActive: true,
  locality: "Formosa",
  organization: { id: "organization-1", name: "Hotel Central", description: null },
} as Accommodation

const globalSummary = {
  from: "2026-10-01",
  to: "2026-10-10",
  totalGuests: 42,
  totalRecords: 7,
  accomodationsCount: 1,
  ageRanges: [],
  travelPurposes: [],
  origins: [],
}

function renderPage(
  view: "summary" | "records" | "reports" = "summary",
  isSystemRole = true,
  initialEntry = "/",
) {
  vi.mocked(useStatisticsPermissions).mockReturnValue({
    isSystemRole,
    isSystemRoleLoading: false,
    canCreate: false,
    canUpdate: false,
  } as never)

  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <MemoryRouter initialEntries={[initialEntry]}>
        <SystemAccommodationStatisticsPage view={view} />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe("SystemAccommodationStatisticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationsApi.list).mockResolvedValue([accommodation])
    vi.mocked(accommodationStatisticsApi.getAllSummary).mockResolvedValue(globalSummary)
    vi.mocked(accommodationStatisticsApi.getSummary).mockResolvedValue({
      from: "2026-10-01", to: "2026-10-10", totalGuests: 12,
      ageRanges: [], travelPurposes: [], origins: [],
    })
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([])
  })

  afterEach(cleanup)

  it("shows the global summary by default and requests the global endpoint", async () => {
    renderPage()

    expect(await screen.findByRole("combobox", { name: "Alojamiento" }))
      .toHaveTextContent("Todos los alojamientos")
    expect(await screen.findByTestId("global-summary")).toHaveTextContent("42:7")
    await waitFor(() => expect(accommodationStatisticsApi.getAllSummary).toHaveBeenCalledWith(
      expect.any(String), expect.any(String),
    ))
  })

  it("shows the selected accommodation summary using the existing per-accommodation view", async () => {
    renderPage("summary", true, "/?accommodationId=accommodation-1")

    await waitFor(() => expect(screen.getByRole("combobox", { name: "Alojamiento" }))
      .toHaveTextContent("Hotel Central — Formosa"))
    expect(await screen.findByTestId("accommodation-statistics-page"))
      .toHaveTextContent("accommodation-1:summary")
    expect(accommodationStatisticsApi.getAllSummary).not.toHaveBeenCalled()
  })

  it("does not expose the global view to non-system users", async () => {
    renderPage("summary", false)

    expect(await screen.findByText(/solo está disponible para usuarios de sistema/i)).toBeInTheDocument()
    expect(accommodationStatisticsApi.getAllSummary).not.toHaveBeenCalled()
    expect(accommodationsApi.list).not.toHaveBeenCalled()
  })

  it("reports all accommodations by default with the global endpoint and period filters", async () => {
    renderPage("reports")

    expect(await screen.findByTestId("global-summary")).toHaveTextContent("42:7")
    expect(screen.getByRole("combobox", { name: "Alojamiento" }))
      .toHaveTextContent("Todos los alojamientos")
    expect(screen.getByRole("group", { name: "Filtrar reportes por período" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("button", { name: "Mes" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Año" })).toBeInTheDocument()
    await waitFor(() => expect(accommodationStatisticsApi.getAllSummary).toHaveBeenCalledWith(
      expect.any(String), expect.any(String),
    ))
  })

  it("refilters the all-accommodations report by week, month, and year", async () => {
    renderPage("reports")

    expect(await screen.findByTestId("global-summary")).toBeInTheDocument()
    const year = new Date().getFullYear()

    fireEvent.click(screen.getByRole("button", { name: "Mes" }))
    await waitFor(() => expect(accommodationStatisticsApi.getAllSummary)
      .toHaveBeenCalledWith(`${year}-${String(new Date().getMonth() + 1).padStart(2, "0")}-01`, expect.any(String)))

    fireEvent.click(screen.getByRole("button", { name: "Año" }))
    await waitFor(() => expect(accommodationStatisticsApi.getAllSummary)
      .toHaveBeenCalledWith(`${year}-01-01`, `${year}-12-31`))
    expect(screen.getByRole("button", { name: "Año" })).toHaveAttribute("aria-pressed", "true")
  })

  it("exports the all-accommodations report as PDF", async () => {
    renderPage("reports")

    fireEvent.click(await screen.findByRole("button", { name: /Exportar PDF/ }))

    await waitFor(() => expect(exportAccommodationStatisticsToPdf).toHaveBeenCalledWith(
      globalSummary,
      [],
      expect.objectContaining({
        scopeLabel: "Todos los alojamientos",
        range: expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
      }),
    ))
  })

  it("does not offer the all-accommodations scope in records", async () => {
    renderPage("records")

    expect(await screen.findByTestId("accommodation-statistics-page"))
      .toHaveTextContent("accommodation-1:records")
    expect(screen.queryByRole("button", { name: "Semana" })).not.toBeInTheDocument()
  })

  it("uses the existing accommodation page for a selected accommodation report", async () => {
    renderPage("reports", true, "/?accommodationId=accommodation-1")

    expect(await screen.findByTestId("accommodation-statistics-page"))
      .toHaveTextContent("accommodation-1:reports")
    expect(accommodationStatisticsApi.getAllSummary).not.toHaveBeenCalled()
  })
})
