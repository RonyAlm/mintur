import { useCallback, useEffect, useMemo, useState } from "react"
import { KeyRoundIcon, RefreshCwIcon, ShieldCheckIcon } from "lucide-react"
import { useSearchParams } from "react-router"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/api-error"
import { hasPermission } from "@/lib/modules"
import permissionsApi, { type Permission} from "@/modules/roles/api/permissions.api"
import rolesApi, { type ManagedRole } from "@/modules/roles/api/roles.api"
import { PermissionFormDialog } from "../components/PermissionFormDialog"
import { PermissionsCatalog } from "../components/PermissionsCatalog"
import { RoleFormDialog } from "../components/RoleFormDialog"
import { RolePermissionsDialog } from "../components/RolePermissionsDialog"
import { RolesTable } from "../components/RolesTable"

type AccessTab = "roles" | "permissions"

const RolesPage = () => {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const canReadRoles = hasPermission(user, "roles:read")
  const canCreateRole = hasPermission(user, "roles:create")
  const canUpdateRole = hasPermission(user, "roles:update")
  const canManagePermissions = hasPermission(user, "roles:manage_permissions")
  const canReadPermissions = hasPermission(user, "permissions:read")
  const canCreatePermission = hasPermission(user, "permissions:create")

  const [roles, setRoles] = useState<ManagedRole[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [roleSearch, setRoleSearch] = useState("")
  const [permissionSearch, setPermissionSearch] = useState("")
  const [roleDialogOpen, setRoleDialogOpen] = useState(false)
  const [permissionDialogOpen, setPermissionDialogOpen] = useState(false)
  const [permissionsDialogOpen, setPermissionsDialogOpen] = useState(false)
  const [editingRole, setEditingRole] = useState<ManagedRole | null>(null)
  const [selectedRole, setSelectedRole] = useState<ManagedRole | null>(null)

const canAccessRoles = canReadRoles || canCreateRole
const canAccessPermissions = canReadPermissions || canCreatePermission

const requestedTab = searchParams.get("tab")

const activeTab: AccessTab =
  requestedTab === "permissions" && canAccessPermissions
    ? "permissions"
    : canAccessRoles
      ? "roles"
      : "permissions"

  const changeTab = (tab: AccessTab) => {
    setSearchParams(tab === "roles" ? {} : { tab }, { replace: true })
  }

const load = useCallback(async () => {
  setLoading(true)

  try {
    const [roleResult, permissionResult] = await Promise.allSettled([
      canReadRoles ? rolesApi.list() : Promise.resolve([]),
      canReadPermissions ? permissionsApi.list() : Promise.resolve([]),
    ])

    if (roleResult.status === "fulfilled") {
      setRoles(roleResult.value as ManagedRole[])
    } else {
      toast.error(getApiErrorMessage(roleResult.reason))
    }

    if (permissionResult.status === "fulfilled") {
      setPermissions(permissionResult.value as Permission[])
    } else {
      toast.error(getApiErrorMessage(permissionResult.reason))
    }
  } finally {
    setLoading(false)
  }
}, [canReadPermissions, canReadRoles])

  // Initial synchronization with the services. Explicit refresh controls loading state.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { void load() }, [load])

  const filteredRoles = useMemo(() => {
    const query = roleSearch.trim().toLocaleLowerCase()
    return roles.filter((role) => `${role.name} ${role.description ?? ""}`.toLocaleLowerCase().includes(query))
  }, [roles, roleSearch])

  const filteredPermissions = useMemo(() => {
    const query = permissionSearch.trim().toLocaleLowerCase()
    return permissions.filter((permission) => `${permission.name} ${permission.description ?? ""}`.toLocaleLowerCase().includes(query))
  }, [permissions, permissionSearch])

const runAction = async (
  action: () => Promise<unknown>,
  successMessage: string,
  refreshSelectedRole = false,
): Promise<boolean> => {
  setWorking(true)

  try {
    await action()
    toast.success(successMessage)
    await load()

    if (refreshSelectedRole && selectedRole && canReadRoles) {
      const refreshedRole = await rolesApi.getById(selectedRole.id)

      setSelectedRole(refreshedRole)
      setRoles((current) =>
        current.map((role) =>
          role.id === refreshedRole.id ? refreshedRole : role,
        ),
      )
    }

    return true
  } catch (error) {
    toast.error(getApiErrorMessage(error))
    return false
  } finally {
    setWorking(false)
  }
}

  const saveRole = async (name: string, description?: string) => {
    const saved = editingRole
      ? await runAction(() => rolesApi.update(editingRole.id, { name, description }), "Rol actualizado.")
      : await runAction(() => rolesApi.create({ name, description }), "Rol creado.")

    if (saved) setRoleDialogOpen(false)
  }

  const savePermission = async (name: string, description?: string) => {
    const saved = await runAction(() => permissionsApi.create({ name, description }), "Permiso creado.")
    if (saved) setPermissionDialogOpen(false)
  }

  const openRolePermissions = async (role: ManagedRole) => {
    setSelectedRole(role)
    setPermissionsDialogOpen(true)
    if (!canReadRoles) return

    try {
      const detail = await rolesApi.getById(role.id)
      setSelectedRole(detail)
      setRoles((current) => current.map((item) => item.id === detail.id ? detail : item))
    } catch (error) {
      toast.error(getApiErrorMessage(error))
    }
  }

  const refresh = () => {
    void load()
  }

  return (
    <section className="flex flex-col gap-5">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Roles y permisos</h2>
          <p className="mt-1 text-sm text-muted-foreground">Administrá los perfiles de acceso y las capacidades del sistema.</p>
        </div>
        <Button size="lg" variant="outline" onClick={refresh} disabled={loading || working}>
          Refrescar
          <RefreshCwIcon className="size-4 ml-2" aria-hidden />
        </Button>
      </header>

      <div className="flex w-fit max-w-full gap-1 rounded-lg bg-muted p-1" role="tablist" aria-label="Administración de accesos">
        {(canReadRoles || canCreateRole) &&
         <button type="button" role="tab" aria-selected={activeTab === "roles"}
          className={`inline-flex items-center gap-2 rounded-md px-3 py-2
           text-sm font-medium transition-colors ${activeTab === "roles" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
           onClick={() => changeTab("roles")}>
            <ShieldCheckIcon className="size-4" />Roles
        </button>}
        {(canReadPermissions || canCreatePermission) &&
        <button type="button" role="tab" aria-selected={activeTab === "permissions"} 
         className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-
          ${activeTab === "permissions" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
           onClick={() => changeTab("permissions")}>
          <KeyRoundIcon className="size-4" />Permisos
        </button>}
      </div>

      {activeTab === "roles" ? (
        <RolesTable
          roles={filteredRoles}
          loading={loading}
          query={roleSearch}
          onQueryChange={setRoleSearch}
          canCreate={canCreateRole}
          canUpdate={canUpdateRole}
          canManagePermissions={canManagePermissions}
          onCreate={() => { setEditingRole(null); setRoleDialogOpen(true) }}
          onEdit={(role) => { setEditingRole(role); setRoleDialogOpen(true) }}
          onManagePermissions={(role) => void openRolePermissions(role)}
        />
      ) : (
        <PermissionsCatalog
          permissions={filteredPermissions}
          loading={loading}
          query={permissionSearch}
          onQueryChange={setPermissionSearch}
          canCreate={canCreatePermission}
          canRead={canReadPermissions}
          onCreate={() => setPermissionDialogOpen(true)}
        />
      )}

      <RoleFormDialog key={editingRole?.id ?? "new-role"} open={roleDialogOpen} onOpenChange={setRoleDialogOpen} role={editingRole} onSave={saveRole} working={working} />
      <PermissionFormDialog open={permissionDialogOpen} onOpenChange={setPermissionDialogOpen} onSave={savePermission} working={working} permissions={permissions} />
      <RolePermissionsDialog
        key={selectedRole?.id ?? "no-role"}
        role={selectedRole}
        permissions={permissions}
        open={permissionsDialogOpen}
        onOpenChange={setPermissionsDialogOpen}
        canManage={canManagePermissions && canReadPermissions}
        working={working}
        onAssign={async (permissionId) => {
          if (!selectedRole) return

          await runAction(
            () => rolesApi.assignPermission(selectedRole.id, permissionId),
            "Permiso asignado al rol.",
            true,
          )
        }}

        onRemove={async (permissionId) => {
          if (!selectedRole) return

          await runAction(
            () => rolesApi.removePermission(selectedRole.id, permissionId),
            "Permiso quitado del rol.",
            true,
          )
        }}
      />
    </section>
  )
}

export default RolesPage
