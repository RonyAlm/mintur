import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTestQueryClient } from "@/test/query-client"
import { AuthContext, type AuthContextType } from "@/modules/auth/context/authContext"
import { organizationsApi } from "@/modules/organizations/api/organizations.api"
import rolesApi from "@/modules/roles/api/roles.api"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { Accommodation } from "../types/accommodation.types"
import OrganizationStatisticsPage, { type StatisticsView } from "./OrganizationStatisticsPage"

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: {
    listMemberAccommodations: vi.fn(),
    listByAccommodation: vi.fn(),
    getSummary: vi.fn(),
    createDailyStatistic: vi.fn(),
    updateDailyStatistic: vi.fn(),
  },
}))

vi.mock("@/modules/organizations/api/organizations.api", () => ({
  organizationsApi: { listMine: vi.fn() },
}))

vi.mock("@/modules/roles/api/roles.api", () => ({
  default: { getById: vi.fn() },
}))

const accommodation = {
  id: "accommodation-1",
  organizationId: "organization-1",
  type: "HOTEL",
  isActive: true,
  locality: "Formosa",
  organization: { id: "organization-1", name: "Hotel Central", description: null },
} as Accommodation

function renderPage(
  view?: StatisticsView,
  permissions = ["accommodation-statistics:read"],
  opts: { memberRole?: "OPERATOR" | "ADMIN" | "OWNER"; isSystemRole?: boolean } = {},
) {
  const { memberRole, isSystemRole = false } = opts
  vi.mocked(organizationsApi.listMine).mockResolvedValue(
    memberRole
      ? [{ id: "m1", organizationId: "org-1", userId: "operator-1", role: memberRole }] as never
      : ([] as never),
  )
  vi.mocked(rolesApi.getById).mockResolvedValue({
    id: "role-1", name: "Operator", description: null, isSystemRole,
  } as never)
  const auth = {
    user: {
      id: "operator-1", username: "operator", firstName: "Test", lastName: "Operator",
      email: "operator@example.com", role: { id: "role-1", name: "Operator", description: null },
      permissions, mustChangePassword: false,
    },
    login: async () => false, logout: async () => {}, loading: false, error: null, updateUser: () => {},
  } satisfies AuthContextType

  return render(
    <AuthContext.Provider value={auth}>
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter><OrganizationStatisticsPage view={view} /></MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  )
}

describe("OrganizationStatisticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationStatisticsApi.listMemberAccommodations).mockResolvedValue([accommodation])
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([])
    vi.mocked(accommodationStatisticsApi.getSummary).mockResolvedValue({
      from: "2026-10-01", to: "2026-10-28", totalGuests: 0,
      ageRanges: [], travelPurposes: [], origins: [],
    })
  })

  afterEach(cleanup)

  it("loads and displays statistics for the operator's assigned accommodation", async () => {
    renderPage()

    expect(await screen.findByRole("heading", { name: "Reportes" })).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Alojamiento" })).toHaveTextContent("Hotel Central")
    expect(await screen.findByRole("heading", { name: "Reportes" })).toBeInTheDocument()
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith(
      "accommodation-1", expect.any(String), expect.any(String),
    ))
  })

  it("explains when the operator has no assigned accommodations", async () => {
    vi.mocked(accommodationStatisticsApi.listMemberAccommodations).mockResolvedValue([])
    renderPage()

    expect(await screen.findByText("No tienes alojamientos asignados.")).toBeInTheDocument()
    expect(accommodationStatisticsApi.getSummary).not.toHaveBeenCalled()
  })

  it("renders the daily entry workflow as its own page", async () => {
    renderPage("entry", ["accommodation-statistics:read", "accommodation-statistics:create"], { memberRole: "OPERATOR" })
    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()
    expect((await screen.findAllByRole("button", { name: "Nueva Estadística" })).length).toBeGreaterThanOrEqual(1)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Mis registros" })).not.toBeInTheDocument()
  })

  it("hides the new statistic button from organization owners who cannot create", async () => {
    renderPage("entry", ["accommodation-statistics:read", "accommodation-statistics:create"], { memberRole: "OWNER" })
    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Nueva Estadística" })).not.toBeInTheDocument()
  })

  it("renders the record history as its own page", async () => {
    renderPage("records")
    expect(await screen.findByRole("heading", { name: "Mis Registros" })).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Huéspedes por rango de edad" })).not.toBeInTheDocument()
  })

  it("labels system-user history as member-loaded records", async () => {
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([{
      id: "record-1", accommodationId: accommodation.id, date: "2026-11-10", totalGuests: 12,
      ageRanges: [], travelPurposes: [], origins: [],
    }])
    renderPage("records", ["accommodation-statistics:read"], { isSystemRole: true })

    expect(await screen.findByRole("heading", { name: "Registros cargados por los miembros" })).toBeInTheDocument()
    expect(await screen.findByText("Historial de cargas diarias realizadas por los miembros en el período seleccionado.")).toBeInTheDocument()
    expect(screen.getByText("12")).toBeInTheDocument()
  })

  it("renders reports separately from record history", async () => {
    renderPage("reports")
    expect(await screen.findByRole("heading", { name: "Reportes" })).toBeInTheDocument()
    expect(await screen.findByText("Huéspedes por rango de edad")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Mis registros" })).not.toBeInTheDocument()
  })
})
