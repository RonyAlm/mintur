import { useAuth } from "@/modules/auth/hooks/useAuth"
import { useStatisticsPermissions } from "@/modules/accommodations/hooks/useStatisticsPermissions"
import { useMyOrganizationMemberships } from "@/modules/organizations/hooks/useMyOrganizationMemberships"
import MinistryDashboard from "../components/MinistryDashboard"
import OperatorDashboard from "../components/OperatorDashboard"
import OwnerDashboard from "../components/OwnerDashboard"
import { resolveDashboardVariant } from "../utils/dashboard.utils"

/**
 * Punto de entrada único del dashboard: resuelve la variante según el rol
 * efectivo del usuario y renderiza la vista correspondiente.
 */
export default function DashboardPage() {
  const { user } = useAuth()
  const memberships = useMyOrganizationMemberships(user?.id)
  const { isSystemRole, isSystemRoleLoading } = useStatisticsPermissions()

  // Mientras se resuelve el rol de sistema, evita el parpadeo entre vistas.
  if (isSystemRoleLoading) {
    return (
      <div
        className="flex min-h-64 items-center justify-center gap-3"
        role="status"
        aria-label="Cargando"
      >
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const variant = resolveDashboardVariant(isSystemRole, memberships)

  if (variant === "owner") return <OwnerDashboard />
  if (variant === "operator") return <OperatorDashboard />
  return <MinistryDashboard />
}
