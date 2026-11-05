import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { createTestQueryClient } from "@/test/query-client"
import { AuthContext, type AuthContextType } from "@/modules/auth/context/authContext"
import { organizationsApi } from "@/modules/organizations/api/organizations.api"
import rolesApi from "@/modules/roles/api/roles.api"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { AccommodationDailyStatistic, AccommodationStatisticsSummary } from "../types/accommodation-statistics.types"
import AccommodationStatisticsPage from "./AccommodationStatisticsPage"
import type { StatisticsView } from "./OrganizationStatisticsPage"
import AccommodationDailyStatisticDetailPage from "./AccommodationDailyStatisticDetailPage"
import { toast } from "sonner"

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: {
    listByAccommodation: vi.fn(),
    getDailyStatistic: vi.fn(),
    getSummary: vi.fn(),
    createDailyStatistic: vi.fn(),
  },
}))

vi.mock("../api/georef.api", () => ({
  georefApi: {
    listProvinces: vi.fn().mockResolvedValue([
      { id: "34", nombre: "Formosa" },
      { id: "06", nombre: "Buenos Aires" },
    ]),
  },
}))

vi.mock("@/modules/organizations/api/organizations.api", () => ({
  organizationsApi: { listMine: vi.fn() },
}))

vi.mock("@/modules/roles/api/roles.api", () => ({
  default: { getById: vi.fn() },
}))

vi.mock("sonner", () => ({ toast: { success: vi.fn() } }))

const { exportMock } = vi.hoisted(() => ({
  exportMock: vi.fn(),
}))

vi.mock("../utils/exportStatisticsPdf", () => ({
  exportAccommodationStatisticsToPdf: exportMock,
}))

async function selectCalendarDate(user: ReturnType<typeof userEvent.setup>, date: Date) {
  const month = new Intl.DateTimeFormat("es-AR", { month: "long" }).format(date)
  const dayButtons = screen.getAllByRole("button", {
    name: new RegExp(`${date.getDate()} de ${month} de ${date.getFullYear()}`),
  })
  await user.click(dayButtons[0])
}

const summary: AccommodationStatisticsSummary = {
  from: "2026-10-01",
  to: "2026-10-27",
  totalGuests: 24,
  ageRanges: [{ ageRange: "AGE_18_30", quantity: 12 }],
  travelPurposes: [{ purpose: "TOURISM", quantity: 18 }],
  origins: [
    { type: "PROVINCE", name: "Buenos Aires", quantity: 20 },
    { type: "COUNTRY", name: "Buenos Aires", quantity: 4 },
  ],
}

const records: AccommodationDailyStatistic[] = [{
  id: "record-1",
  accommodationId: "stay-1",
  date: "2026-10-27",
  totalGuests: 24,
  ageRanges: [],
  travelPurposes: [],
  origins: [],
}]

function renderPage(
  permissions = ["accommodation-statistics:read"],
  view?: StatisticsView,
  opts: { memberRole?: "OPERATOR" | "ADMIN" | "OWNER"; isSystemRole?: boolean } = {},
) {
  const { memberRole, isSystemRole = true } = opts
  vi.mocked(organizationsApi.listMine).mockResolvedValue(
    memberRole
      ? [{ id: "m1", organizationId: "org-1", userId: "user-1", role: memberRole }] as never
      : ([] as never),
  )
  vi.mocked(rolesApi.getById).mockResolvedValue({
    id: "role-1", name: "User", description: null, isSystemRole,
  } as never)
  const value = {
    user: {
      id: "user-1",
      username: "user",
      firstName: "Test",
      lastName: "User",
      email: "user@example.com",
      role: { id: "role-1", name: "User", description: null },
      permissions,
      mustChangePassword: false,
    },
    login: async () => false,
    logout: async () => {},
    loading: false,
    error: null,
    updateUser: () => {},
  } satisfies AuthContextType

  return render(
    <AuthContext.Provider value={value}>
      <QueryClientProvider client={createTestQueryClient()}>
        <MemoryRouter initialEntries={["/alojamientos/stay-1/estadisticas"]}>
          <Routes>
            <Route path="/alojamientos/:id/estadisticas" element={<AccommodationStatisticsPage view={view} />} />
            <Route path="/estadisticas/mis-registros/:recordId" element={<AccommodationDailyStatisticDetailPage />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </AuthContext.Provider>,
  )
}

describe("AccommodationStatisticsPage", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue(records)
    vi.mocked(accommodationStatisticsApi.getDailyStatistic).mockResolvedValue(records[0])
    vi.mocked(accommodationStatisticsApi.getSummary).mockResolvedValue(summary)
    vi.mocked(accommodationStatisticsApi.createDailyStatistic).mockResolvedValue(records[0])
  })

  afterEach(cleanup)

  it("loads accommodation summary and displays guest statistics", async () => {
    renderPage()

    expect(await screen.findByRole("heading", { name: "Estadísticas del alojamiento" })).toBeInTheDocument()
    expect((await screen.findAllByText("24")).length).toBeGreaterThan(0)
    expect(screen.getByText("18 a 30 años")).toBeInTheDocument()
    expect(screen.getByText("Turismo")).toBeInTheDocument()
    expect(screen.getAllByText("Buenos Aires")).toHaveLength(2)
    expect(screen.getByText("Provincia")).toBeInTheDocument()
    expect(screen.getByText("País")).toBeInTheDocument()
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith(
      "stay-1",
      expect.any(String),
      expect.any(String),
    ))
  })

  it("shows a useful error when loading statistics fails", async () => {
    vi.mocked(accommodationStatisticsApi.getSummary).mockRejectedValue(new Error("failure"))
    renderPage()

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar las estadísticas")
  })

  it("shows the daily entry action only with the create permission", async () => {
    renderPage(["accommodation-statistics:read"], "entry")
    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Nueva Estadística" })).not.toBeInTheDocument()

    cleanup()
    renderPage(["accommodation-statistics:read", "accommodation-statistics:create"], "entry")
    expect(await screen.findByRole("button", { name: "Nueva Estadística" })).toBeInTheDocument()
  })

  it("hides the create/edit actions from organization owners while still showing statistics", async () => {
    renderPage(
      ["accommodation-statistics:read", "accommodation-statistics:create", "accommodation-statistics:update"],
      "entry",
      { memberRole: "OWNER", isSystemRole: false },
    )

    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Nueva Estadística" })).not.toBeInTheDocument()
  })

  it("opens the daily entry form in a dialog", async () => {
    renderPage(["accommodation-statistics:read", "accommodation-statistics:create"], "entry")

    fireEvent.click(await screen.findByRole("button", { name: "Nueva Estadística" }))

    expect(await screen.findByRole("dialog")).toHaveTextContent("Carga diaria de estadística")
    expect(screen.getByRole("button", { name: "Guardar estadística" })).toBeInTheDocument()
  })

  it("navigates to the record detail page from the daily list", async () => {
    vi.mocked(accommodationStatisticsApi.getDailyStatistic).mockResolvedValue({
      ...records[0],
      ageRanges: [
        { statisticId: "record-1", ageRange: "AGE_18_30", quantity: 2 },
        { statisticId: "record-1", ageRange: "AGE_31_45", quantity: 0 },
        { statisticId: "record-1", ageRange: "AGE_46_60", quantity: 1 },
      ],
    })
    renderPage(["accommodation-statistics:read", "accommodation-statistics:update"])

    fireEvent.click(await screen.findByRole("button", { name: "Ver registro del 27/10/2026" }))

    expect(await screen.findByRole("heading", { name: "Detalle del registro" })).toBeInTheDocument()
    expect(screen.getByText("24")).toBeInTheDocument()
    const recordSummary = screen.getByRole("region", { name: "Resumen del registro" })
    expect(within(recordSummary).getByText("2")).toBeInTheDocument()
    expect(screen.queryByText("31 a 45 años")).not.toBeInTheDocument()
    expect(screen.getByRole("link", { name: "Volver a Mis Registros" })).toHaveAttribute("href", "/estadisticas/mis-registros?accommodationId=stay-1")
    expect(accommodationStatisticsApi.getDailyStatistic).toHaveBeenCalledWith("record-1")

    fireEvent.click(screen.getByRole("button", { name: "Editar registro" }))
    expect(await screen.findByRole("dialog")).toHaveTextContent("Editar registro")
    expect(screen.getByRole("button", { name: "Guardar cambios" })).toBeInTheDocument()
  })

  it("paginates the Mis Registros table with shadcn-style controls", async () => {
    const manyRecords = Array.from({ length: 12 }, (_, index) => ({
      ...records[0],
      id: `record-${index + 1}`,
      date: `2026-10-${String(index + 1).padStart(2, "0")}`,
    }))
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue(manyRecords)
    renderPage(["accommodation-statistics:read"])

    expect(await screen.findByRole("button", { name: "Siguiente" })).toBeEnabled()
    const recordsTable = screen.getAllByRole("table").find((table) => table.textContent?.includes("Acciones"))
    expect(recordsTable).toBeDefined()
    expect(within(recordsTable!).getAllByRole("row")).toHaveLength(11)
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Siguiente" }))
    expect(within(recordsTable!).getAllByRole("row")).toHaveLength(3)
    expect(screen.getByText("Página 2 de 2")).toBeInTheDocument()
    expect(screen.getByText("12/10/2026")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Anterior" }))
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument()
    expect(within(recordsTable!).getByText(/1\/10\/2026/)).toBeInTheDocument()
  })

  it("sorts all records by date in ascending and descending order", async () => {
    const manyRecords = Array.from({ length: 12 }, (_, index) => ({
      ...records[0],
      id: `record-${index + 1}`,
      date: `2026-10-${String(index + 1).padStart(2, "0")}`,
    }))
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue(manyRecords)
    renderPage(["accommodation-statistics:read"])

    await screen.findByRole("button", { name: "Ordenar por fecha" })
    const recordsTable = screen.getAllByRole("table").find((table) => table.textContent?.includes("Acciones"))!
    fireEvent.click(screen.getByRole("button", { name: "Ordenar por fecha" }))
    expect(within(recordsTable).getAllByRole("row")[1]).toHaveTextContent("1/10/2026")
    expect(screen.getByText("Página 1 de 2")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Ordenar por fecha (ascendente)" }))
    expect(within(recordsTable).getAllByRole("row")[1]).toHaveTextContent("12/10/2026")
  })

  it("defaults Mis Registros to the current week and supports month, year, and custom ranges", async () => {
    renderPage(["accommodation-statistics:read"], "records")
    const today = new Date()
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    const toInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(weekStart), toInput(weekEnd)))
    expect(screen.getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true")

    fireEvent.click(screen.getByRole("button", { name: "Mes" }))
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)
    const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0)
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(monthStart), toInput(monthEnd)))

    fireEvent.click(screen.getByRole("button", { name: "Año" }))
    const yearStart = new Date(today.getFullYear(), 0, 1)
    const yearEnd = new Date(today.getFullYear(), 11, 31)
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(yearStart), toInput(yearEnd)))

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Rango de fechas" }))
    const customStart = new Date(today.getFullYear(), 0, 5)
    const customEnd = new Date(today.getFullYear(), 0, 15)
    await selectCalendarDate(user, customStart)
    await selectCalendarDate(user, customEnd)
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(customStart), toInput(customEnd)))
  })

  it("provides week, month, year, and custom date filters on reports", async () => {
    renderPage(["accommodation-statistics:read"], "reports")
    const today = new Date()
    const toInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`

    const filters = screen.getByRole("group", { name: "Filtrar reportes por período" })
    const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    weekStart.setDate(weekStart.getDate() - ((weekStart.getDay() + 6) % 7))
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekEnd.getDate() + 6)
    expect(within(filters).getByRole("button", { name: "Semana" })).toHaveAttribute("aria-pressed", "true")
    expect(within(filters).getByRole("button", { name: "Mes" })).toBeInTheDocument()
    expect(within(filters).getByRole("button", { name: "Año" })).toBeInTheDocument()
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(weekStart), toInput(weekEnd)))

    fireEvent.click(within(filters).getByRole("button", { name: "Mes" }))
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(new Date(today.getFullYear(), today.getMonth(), 1)), toInput(new Date(today.getFullYear(), today.getMonth() + 1, 0))))

    fireEvent.click(within(filters).getByRole("button", { name: "Año" }))
    const yearEnd = new Date(today.getFullYear(), 11, 31)
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", toInput(new Date(today.getFullYear(), 0, 1)), toInput(yearEnd)))

    const user = userEvent.setup()
    await user.click(screen.getByRole("button", { name: "Rango de fechas" }))
    await selectCalendarDate(user, new Date(today.getFullYear(), 1, 1))
    await selectCalendarDate(user, new Date(today.getFullYear(), 1, 20))
    await waitFor(() => expect(accommodationStatisticsApi.getSummary).toHaveBeenCalledWith("stay-1", `${today.getFullYear()}-02-01`, `${today.getFullYear()}-02-20`))
  })

  it("shows charts for age, travel purpose, and guest origin on reports", async () => {
    renderPage(["accommodation-statistics:read"], "reports")

    expect(await screen.findByText("Evolución diaria de huéspedes")).toBeInTheDocument()
    expect(await screen.findByText("Huéspedes por rango de edad")).toBeInTheDocument()
    expect(screen.getByText("Huéspedes por motivo del viaje")).toBeInTheDocument()
    expect(screen.getByText("Huéspedes por procedencia")).toBeInTheDocument()
    expect(screen.getByText("Turismo").parentElement?.querySelector("[aria-hidden='true']")).toHaveStyle({ backgroundColor: "rgb(37, 99, 235)" })
  })

  it("exports the reports as PDF from the reports view", async () => {
    renderPage(["accommodation-statistics:read"], "reports")

    await screen.findByText("Evolución diaria de huéspedes")
    fireEvent.click(screen.getByRole("button", { name: "Exportar PDF" }))

    expect(exportMock).toHaveBeenCalledWith(
      summary,
      records,
      expect.objectContaining({
        range: expect.objectContaining({ from: expect.any(String), to: expect.any(String) }),
        title: "Reporte de estadísticas",
      }),
    )
  })

  it("does not show the export action outside the reports view", async () => {
    renderPage(["accommodation-statistics:read"], "records")
    expect(await screen.findByRole("heading", { name: "Mis Registros" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Exportar PDF" })).not.toBeInTheDocument()
  })

  it("shows the daily status dashboard and opens the new-entry dialog", async () => {
    renderPage(["accommodation-statistics:read", "accommodation-statistics:create"], "entry")

    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()
    expect(screen.getByText("Estado de carga")).toBeInTheDocument()
    expect(screen.getByText("Registros del mes")).toBeInTheDocument()
    expect(screen.getAllByText("Pendiente").length).toBeGreaterThan(0)

    fireEvent.click(await screen.findByRole("button", { name: "Nueva Estadística" }))

    expect(await screen.findByRole("dialog")).toHaveTextContent("Carga diaria de estadística")
    expect(screen.getByRole("button", { name: "Guardar estadística" })).toBeInTheDocument()
  })

  it("loads the full current month for the daily entry dashboard", async () => {
    renderPage(["accommodation-statistics:read"], "entry")

    expect(await screen.findByRole("heading", { name: "Estadísticas diarias" })).toBeInTheDocument()

    const today = new Date()
    const toInput = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
    const monthStart = toInput(new Date(today.getFullYear(), today.getMonth(), 1))
    const monthEnd = toInput(new Date(today.getFullYear(), today.getMonth() + 1, 0))

    await waitFor(() => expect(accommodationStatisticsApi.listByAccommodation).toHaveBeenCalledWith(
      "stay-1", monthStart, monthEnd,
    ))
  })

  it("shows a success toast after saving", async () => {
    renderPage(["accommodation-statistics:read", "accommodation-statistics:create"], "entry")
    const user = userEvent.setup()
    await user.click(await screen.findByRole("button", { name: "Nueva Estadística" }))

    fireEvent.change(screen.getByLabelText("Total de huéspedes"), { target: { value: "2" } })
    fireEvent.change(screen.getByLabelText("18 a 30 años"), { target: { value: "2" } })

    await user.click(screen.getByRole("tab", { name: "Motivos de viaje" }))
    fireEvent.change(screen.getByLabelText("Motivo Turismo"), { target: { value: "2" } })

    await user.click(screen.getByRole("tab", { name: "Procedencias" }))
    await user.click(screen.getByRole("combobox", { name: "Nombre de procedencia 1" }))
    await user.click(await screen.findByRole("option", { name: "Formosa" }))
    fireEvent.change(screen.getByLabelText("Huéspedes de procedencia 1"), { target: { value: "2" } })

    await user.click(screen.getByRole("button", { name: "Guardar estadística" }))

    await waitFor(() => expect(toast.success).toHaveBeenCalledWith(
      "¡Registro guardado correctamente!",
      expect.objectContaining({
        description: "La información del 27 de octubre de 2026 se ha guardado.",
        classNames: expect.objectContaining({
          toast: expect.stringContaining("bg-card"),
        }),
      }),
    ))
  })
})
