import type { ManagedRole } from "@/modules/roles/api/roles.api"
import type { ManagedUser } from "@/modules/users/api/users.api"

export function getEligibleMemberUsers(
  users: ManagedUser[],
  roles: ManagedRole[],
  currentMemberIds: Set<string>,
): ManagedUser[] {
  const systemRoleIds = new Set(
    roles.filter(({ isSystemRole }) => isSystemRole).map(({ id }) => id),
  )
  const knownRoleIds = new Set(roles.map(({ id }) => id))

  return users.filter(({ id, roleId }) =>
    !currentMemberIds.has(id) && knownRoleIds.has(roleId) && !systemRoleIds.has(roleId),
  )
}
