import { cleanup, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router"
import { AuthContext, type AuthContextType } from "@/modules/auth/context/authContext"
import { organizationsApi } from "../api/organizations.api"
import { accommodationsApi } from "@/modules/accommodations/api/accommodations.api"
import MyOrganizationsPage from "./MyOrganizationsPage"

vi.mock("../api/organizations.api", () => ({
  organizationsApi: {
    listMine: vi.fn(),
    listMembers: vi.fn(),
  },
}))

vi.mock("@/modules/accommodations/api/accommodations.api", () => ({
  accommodationsApi: { getByOrganization: vi.fn() },
}))

const membership = (role: "OWNER" | "ADMIN" | "OPERATOR") => ({
  organizationId: `org-${role.toLowerCase()}`,
  userId: "user-1",
  role,
  organization: {
    id: `org-${role.toLowerCase()}`,
    name: `Organization ${role}`,
    type: role === "OWNER" ? "ACCOMMODATION" : "OTHER",
    description: "Accommodation organization",
    isActive: true,
  },
})

const authUser = (permissions: string[]) => ({
  id: "user-1",
  email: "person@example.com",
  username: "person",
  firstName: "Test",
  lastName: "User",
  role: { id: "role-1", name: "Member", description: null },
  permissions,
  mustChangePassword: false,
})

function renderPage(permissions: string[]) {
  const value = {
    user: authUser(permissions),
    login: async () => false,
    logout: async () => {},
    loading: false,
    error: null,
    updateUser: () => {},
  } satisfies AuthContextType

  return render(
    <AuthContext.Provider value={value}>
      <MemoryRouter>
        <MyOrganizationsPage />
      </MemoryRouter>
    </AuthContext.Provider>,
  )
}

describe("MyOrganizationsPage", () => {
  beforeEach(() => {
    cleanup()
    vi.clearAllMocks()
    vi.mocked(organizationsApi.listMine).mockResolvedValue([
      membership("OWNER"),
      membership("ADMIN"),
      membership("OPERATOR"),
    ])
    vi.mocked(organizationsApi.listMembers).mockResolvedValue([
      {
        organizationId: "org-owner",
        userId: "user-2",
        role: "OPERATOR",
        user: { id: "user-2", username: "laura.perez", email: "laura@example.com" },
      },
    ])
    vi.mocked(accommodationsApi.getByOrganization).mockResolvedValue({
      id: "stay-1", organizationId: "org-owner", type: "HOTEL", isActive: true,
      capacity: 40, totalRooms: 20, totalBeds: 40, image: null,
      locality: "Salta", address: "Calle 123", addressMap: null,
      phoneOne: "555-0100", phoneTwo: null, email: "hotel@example.com",
      website: "https://hotel.example.com", instagram: null, facebook: null,
      createdAt: "2025-01-01", updatedAt: "2025-01-01",
      organization: { id: "org-owner", name: "Organization OWNER", description: null },
    })
  })

  it("shows the user's organizations and loads member lists only for OWNER/ADMIN when authorized", async () => {
    renderPage(["organization_members:read", "accommodation-statistics:read"])

    expect(await screen.findByText("Organization OWNER")).toBeInTheDocument()
    expect(screen.getByText("Organization ADMIN")).toBeInTheDocument()
    expect(screen.getByText("Organization OPERATOR")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Mis organizaciones" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "3 Organizaciones" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "5 Miembros" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "2 Administrador" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "3 Operador" })).toBeInTheDocument()

    await waitFor(() => {
      expect(organizationsApi.listMembers).toHaveBeenCalledTimes(2)
      expect(organizationsApi.listMembers).toHaveBeenCalledWith("org-owner")
      expect(organizationsApi.listMembers).toHaveBeenCalledWith("org-admin")
      expect(screen.queryByText("Miembros de Organization OPERATOR")).not.toBeInTheDocument()
    })
    expect(await screen.findAllByText("laura.perez")).toHaveLength(2)
    expect(screen.getAllByText("laura@example.com")).toHaveLength(2)
    expect(await screen.findByText("Información general")).toBeInTheDocument()
    expect(screen.getAllByText("Hotel")).toHaveLength(2)
    expect(screen.getAllByText("Salta")).toHaveLength(2)
    expect(screen.getByRole("link", { name: "Ver estadísticas de Organization OWNER" }))
      .toHaveAttribute("href", "/estadisticas/reportes?accommodationId=stay-1")
    expect(accommodationsApi.getByOrganization).toHaveBeenCalledWith("org-owner")
  })

  it("counts operators from the organization members instead of the current user's role", async () => {
    vi.mocked(organizationsApi.listMine).mockResolvedValue([membership("ADMIN")])
    vi.mocked(organizationsApi.listMembers).mockResolvedValue([
      {
        organizationId: "org-admin",
        userId: "user-1",
        role: "ADMIN",
        user: { id: "user-1", username: "person", email: "person@example.com" },
      },
      {
        organizationId: "org-admin",
        userId: "user-2",
        role: "OPERATOR",
        user: { id: "user-2", username: "laura.perez", email: "laura@example.com" },
      },
    ])

    renderPage(["organization_members:read"])

    expect(await screen.findByRole("article", { name: "1 Operador" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "1 Administrador" })).toBeInTheDocument()
    expect(screen.getByRole("article", { name: "2 Miembros" })).toBeInTheDocument()
  })

  it("does not request or show member lists without the global read permission", async () => {
    renderPage([])

    expect(await screen.findByText("Organization ADMIN")).toBeInTheDocument()
    expect(organizationsApi.listMembers).not.toHaveBeenCalled()
    expect(screen.queryByText("Miembros de Organization ADMIN")).not.toBeInTheDocument()
  })

  it("clears prior organization and member data when a membership reload fails", async () => {
    vi.mocked(organizationsApi.listMine)
      .mockResolvedValueOnce([membership("OWNER")])
      .mockRejectedValueOnce(new Error("Request failed"))

    const view = renderPage(["organization_members:read"])
    expect(await screen.findByText("laura.perez")).toBeInTheDocument()

    const updatedAuth = {
      user: authUser([]),
      login: async () => false,
      logout: async () => {},
      loading: false,
      error: null,
      updateUser: () => {},
    } satisfies AuthContextType
    view.rerender(
      <AuthContext.Provider value={updatedAuth}>
        <MemoryRouter>
          <MyOrganizationsPage />
        </MemoryRouter>
      </AuthContext.Provider>,
    )

    expect(await screen.findByRole("alert")).toHaveTextContent("No se pudieron cargar tus organizaciones")
    expect(screen.queryByText("Organization OWNER")).not.toBeInTheDocument()
    expect(screen.queryByText("laura.perez")).not.toBeInTheDocument()
    expect(screen.queryByText("laura@example.com")).not.toBeInTheDocument()
  })
})
