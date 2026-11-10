import { cleanup, render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router"
import { QueryClientProvider } from "@tanstack/react-query"
import { addDays, format, startOfWeek } from "date-fns"
import { AuthContext, type AuthContextType } from "@/modules/auth/context/authContext"
import { createTestQueryClient } from "@/test/query-client"
import { accommodationsApi } from "../api/accommodations.api"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import { organizationsApi } from "@/modules/organizations/api/organizations.api"
import usersApi from "@/modules/users/api/users.api"
import rolesApi from "@/modules/roles/api/roles.api"
import { toast } from "sonner"
import AccommodationDetailPage from "./AccommodationDetailPage"

vi.mock("../api/accommodations.api", () => ({
  accommodationsApi: { getById: vi.fn() },
}))

vi.mock("../api/accommodation-statistics.api", () => ({
  accommodationStatisticsApi: { listByAccommodation: vi.fn() },
}))

vi.mock("@/modules/organizations/api/organizations.api", () => ({
  organizationsApi: {
    listMine: vi.fn(),
    listMembers: vi.fn(),
    addMember: vi.fn(),
    removeMember: vi.fn(),
  },
}))

vi.mock("@/modules/users/api/users.api", () => ({
  default: { list: vi.fn() },
}))

vi.mock("@/modules/roles/api/roles.api", () => ({
  default: { getById: vi.fn(), list: vi.fn() },
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

const accommodation = {
  id: "stay-1",
  organizationId: "org-1",
  type: "HOTEL" as const,
  isActive: true,
  capacity: 20,
  totalRooms: 10,
  totalBeds: 15,
  image: null,
  locality: "Formosa",
  address: "Calle 1",
  addressMap: null,
  phoneOne: null,
  phoneTwo: null,
  email: null,
  website: null,
  instagram: null,
  facebook: null,
  createdAt: "2026-01-01",
  updatedAt: "2026-01-01",
  organization: { id: "org-1", name: "Hotel Uno", description: null },
}

const currentMember = {
  organizationId: "org-1",
  userId: "member-1",
  role: "ADMIN" as const,
  user: { id: "member-1", username: "existing-member", email: "existing@example.com" },
}

const userOptions = [
  { id: "regular-1", username: "regular-user", firstName: "Regular", lastName: "User", email: "regular@example.com", roleId: "role-user", isActive: true, mustChangePassword: false },
  { id: "system-1", username: "system-user", firstName: "System", lastName: "User", email: "system@example.com", roleId: "role-system", isActive: true, mustChangePassword: false },
]

function renderPage() {
  const value = {
    user: {
      id: "system-admin",
      username: "system-admin",
      firstName: "System",
      lastName: "Admin",
      email: "admin@example.com",
      role: { id: "role-system", name: "System", description: null },
      permissions: [
        "organization_members:read",
        "organization_members:create",
        "organization_members:delete",
        "accommodation-statistics:read",
      ],
      mustChangePassword: false,
    },
    login: async () => false,
    logout: async () => {},
    loading: false,
    error: null,
    updateUser: () => {},
  } satisfies AuthContextType

  return render(
    <QueryClientProvider client={createTestQueryClient()}>
      <AuthContext.Provider value={value}>
        <MemoryRouter initialEntries={["/alojamientos/stay-1"]}>
          <Routes>
            <Route path="/alojamientos/:id" element={<AccommodationDetailPage />} />
            <Route path="/alojamientos/:id/estadisticas" element={<div>Estadísticas del alojamiento</div>} />
          </Routes>
        </MemoryRouter>
      </AuthContext.Provider>
    </QueryClientProvider>,
  )
}

describe("AccommodationDetailPage member controls", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(accommodationsApi.getById).mockResolvedValue(accommodation)
    vi.mocked(rolesApi.getById).mockResolvedValue({ id: "role-system", name: "System", description: null, isSystemRole: true })
    vi.mocked(rolesApi.list).mockResolvedValue([
      { id: "role-user", name: "User", description: null, isSystemRole: false },
      { id: "role-system", name: "System", description: null, isSystemRole: true },
    ])
    vi.mocked(usersApi.list).mockResolvedValue(userOptions)
    vi.mocked(organizationsApi.listMembers).mockResolvedValue([currentMember])
    vi.mocked(organizationsApi.addMember).mockResolvedValue({
      organizationId: "org-1", userId: "regular-1", role: "OPERATOR",
      user: { id: "regular-1", username: "regular-user", email: "regular@example.com" },
    })
    vi.mocked(organizationsApi.removeMember).mockResolvedValue(undefined)
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([])
  })

  afterEach(cleanup)

  it("adds a non-system user selected in the dialog and shows a success toast", async () => {
    const user = userEvent.setup()
    renderPage()

    expect(await screen.findByText("existing-member")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Agregar miembro" }))
    const dialog = await screen.findByRole("dialog")
    const picker = within(dialog).getByRole("combobox", { name: "Usuario" })
    await user.click(picker)

    expect(await screen.findByRole("option", { name: /regular-user/ })).toBeInTheDocument()
    expect(screen.queryByRole("option", { name: /system-user/ })).not.toBeInTheDocument()
    await user.click(screen.getByRole("option", { name: /regular-user/ }))
    await user.click(within(dialog).getByRole("button", { name: "Agregar miembro" }))

    await waitFor(() => expect(organizationsApi.addMember).toHaveBeenCalledWith("org-1", {
      userId: "regular-1",
      role: "OPERATOR",
    }))
    expect(toast.success).toHaveBeenCalledWith("El miembro se agregó correctamente.")
  })

  it("requires confirmation before removing a member and shows a success toast", async () => {
    const user = userEvent.setup()
    renderPage()

    const removeButton = await screen.findByRole("button", { name: "Remover a existing-member" })
    await user.click(removeButton)
    const confirmation = await screen.findByRole("alertdialog")
    expect(within(confirmation).getByText(/¿Estás seguro de que deseas remover a existing-member/)).toBeInTheDocument()
    await user.click(within(confirmation).getByRole("button", { name: "Cancelar" }))
    expect(organizationsApi.removeMember).not.toHaveBeenCalled()

    await user.click(removeButton)
    const reopenedConfirmation = await screen.findByRole("alertdialog")
    await user.click(within(reopenedConfirmation).getByRole("button", { name: "Remover" }))

    await waitFor(() => expect(organizationsApi.removeMember).toHaveBeenCalledWith("org-1", "member-1"))
    expect(toast.success).toHaveBeenCalledWith("El miembro se removió correctamente.")
  })

  it("summarizes the current week and links to the statistics page", async () => {
    const user = userEvent.setup()
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
    vi.mocked(accommodationStatisticsApi.listByAccommodation).mockResolvedValue([
      { id: "r1", accommodationId: "stay-1", date: format(monday, "yyyy-MM-dd"), totalGuests: 12, ageRanges: [], travelPurposes: [], origins: [] },
      { id: "r2", accommodationId: "stay-1", date: format(addDays(monday, 1), "yyyy-MM-dd"), totalGuests: 7, ageRanges: [], travelPurposes: [], origins: [] },
    ])

    renderPage()

    expect(await screen.findByText("19")).toBeInTheDocument()
    expect(screen.getByText("Total:")).toBeInTheDocument()
    expect(screen.getByText("2 de 7 días cargados")).toBeInTheDocument()
    expect(accommodationStatisticsApi.listByAccommodation).toHaveBeenCalledWith(
      "stay-1",
      format(monday, "yyyy-MM-dd"),
      format(addDays(monday, 6), "yyyy-MM-dd"),
    )

    const detailsLink = screen.getByRole("link", { name: /Ver más detalles/ })
    expect(detailsLink).toHaveAttribute("href", "/alojamientos/stay-1/estadisticas")
    await user.click(detailsLink)
    expect(await screen.findByText("Estadísticas del alojamiento")).toBeInTheDocument()
  })
})
