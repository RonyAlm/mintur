import { useEffect, useState } from "react"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { getVisibleModules, hasPermission } from "@/lib/modules"
import { useMyOrganizationMemberships } from "@/modules/organizations/hooks/useMyOrganizationMemberships"
import permissionsApi from "@/modules/roles/api/permissions.api"
import rolesApi from "@/modules/roles/api/roles.api"
import usersApi from "@/modules/users/api/users.api"

export interface MinistryCounts {
  users?: number
  roles?: number
  permissions?: number
}

/**
 * Datos de la vista de Ministerio: contadores administrativos y módulos
 * visibles según los permisos del perfil.
 */
export function useMinistryDashboard() {
  const { user } = useAuth()
  const memberships = useMyOrganizationMemberships(user?.id)
  const hasStatisticsAccess = memberships.length > 0
  const [counts, setCounts] = useState<MinistryCounts>({})

  const canReadUsers = hasPermission(user, "users:read")
  const canReadRoles = hasPermission(user, "roles:read")
  const canReadPermissions = hasPermission(user, "permissions:read")

  useEffect(() => {
    let cancelled = false

    const loadCounts = async () => {
      const [usersResult, rolesResult, permissionsResult] = await Promise.allSettled([
        canReadUsers ? usersApi.list() : Promise.resolve(undefined),
        canReadRoles ? rolesApi.list() : Promise.resolve(undefined),
        canReadPermissions ? permissionsApi.list() : Promise.resolve(undefined),
      ])

      if (cancelled) return
      setCounts({
        ...(usersResult.status === "fulfilled" && usersResult.value
          ? { users: usersResult.value.length }
          : {}),
        ...(rolesResult.status === "fulfilled" && rolesResult.value
          ? { roles: rolesResult.value.length }
          : {}),
        ...(permissionsResult.status === "fulfilled" && permissionsResult.value
          ? { permissions: permissionsResult.value.length }
          : {}),
      })
    }

    void loadCounts()
    return () => {
      cancelled = true
    }
  }, [canReadPermissions, canReadRoles, canReadUsers])

  const modules = getVisibleModules(user, hasStatisticsAccess)

  return {
    counts,
    modules,
    canReadUsers,
    canReadRoles,
    canReadPermissions,
  }
}
