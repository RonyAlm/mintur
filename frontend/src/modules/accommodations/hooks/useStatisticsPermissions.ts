import { useContext, useEffect, useState } from "react"
import { AuthContext } from "@/modules/auth/context/authContext"
import { canManageStatistics, hasPermission } from "@/lib/modules"
import { useMyOrganizationMemberships } from "@/modules/organizations/hooks/useMyOrganizationMemberships"
import rolesApi from "@/modules/roles/api/roles.api"

/**
 * Permisos efectivos de estadísticas para el usuario autenticado.
 *
 * Regla de negocio: cualquier miembro de una organización (incluido OWNER) VE
 * las estadísticas; solo OPERATOR/ADMIN (o un system admin, que el backend
 * bypasea) pueden CREAR o EDITAR registros.
 */
export function useStatisticsPermissions() {
  const auth = useContext(AuthContext)
  const memberships = useMyOrganizationMemberships(auth?.user?.id)
  const [systemRoleResult, setSystemRoleResult] = useState<{
    roleId: string
    isSystemRole: boolean
  } | null>(null)
  const roleId = auth?.user?.role?.id

  useEffect(() => {
    if (!roleId) {
      return
    }
    let active = true
    rolesApi.getById(roleId)
      .then((role) => { if (active) setSystemRoleResult({ roleId, isSystemRole: role.isSystemRole }) })
      .catch(() => { if (active) setSystemRoleResult({ roleId, isSystemRole: false }) })
    return () => { active = false }
  }, [roleId])

  const isSystemRole = Boolean(roleId && systemRoleResult?.roleId === roleId && systemRoleResult.isSystemRole)
  const isSystemRoleLoading = Boolean(roleId && systemRoleResult?.roleId !== roleId)

  const canManageRecords = isSystemRole || canManageStatistics(memberships)

  return {
    isSystemRole,
    isSystemRoleLoading,
    canCreate: canManageRecords && hasPermission(auth?.user ?? null, "accommodation-statistics:create"),
    canUpdate: canManageRecords && hasPermission(auth?.user ?? null, "accommodation-statistics:update"),
  }
}
