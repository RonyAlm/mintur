import { render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router"
import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"

vi.mock("@/modules/auth/hooks/useAuth", () => ({
  useAuth: () => ({
    user: {
      id: "system-user",
      username: "system-user",
      firstName: "System",
      lastName: "User",
      email: "system@example.test",
      role: { id: "system-role", name: "System", description: null },
      permissions: ["accommodations:read", "accommodation-statistics:read"],
      mustChangePassword: false,
    },
    logout: vi.fn(),
  }),
}))

vi.mock("@/modules/organizations/hooks/useMyOrganizationMemberships", () => ({
  useMyOrganizationMemberships: () => [],
}))

vi.mock("@/modules/accommodations/hooks/useStatisticsPermissions", () => ({
  useStatisticsPermissions: () => ({
    isSystemRole: true,
    isSystemRoleLoading: false,
    canCreate: false,
    canUpdate: false,
  }),
}))

vi.mock("@/hooks/use-mobile", () => ({ useIsMobile: () => false }))

describe("AppSidebar", () => {
  it("nests the system statistics pages under accommodations", () => {
    render(
      <SidebarProvider>
        <MemoryRouter initialEntries={["/alojamientos/estadisticas"]}>
          <AppSidebar />
        </MemoryRouter>
      </SidebarProvider>,
    )

    expect(screen.getByRole("button", { name: /Alojamientos/ })).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByRole("link", { name: "Todos los alojamientos" })).toHaveAttribute("href", "/alojamientos")
    expect(screen.getByRole("link", { name: "Resumen" })).toHaveAttribute("href", "/alojamientos/estadisticas")
    expect(screen.getByRole("link", { name: "Registros diarios" })).toHaveAttribute("href", "/alojamientos/estadisticas/registros")
    expect(screen.getByRole("link", { name: "Reportes" })).toHaveAttribute("href", "/alojamientos/estadisticas/reportes")
    expect(screen.queryByRole("link", { name: "Carga diaria" })).not.toBeInTheDocument()
  })
})
