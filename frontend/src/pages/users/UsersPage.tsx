import { useCallback, useEffect, useState } from "react"
import { CopyIcon, KeyRoundIcon, MailIcon } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/hooks/useAuth"
import { getApiErrorMessage } from "@/lib/api-error"
import { hasPermission } from "@/lib/modules"
import usersService, { type ManagedUser } from "@/services/users.service"
import rolesService, { type ManagedRole } from "@/services/roles.service"
import { UserFormDialog } from "./UserFormDialog"
import { UsersTable } from "./UsersTable"
import { UsersToolbar } from "./UsersToolbar"
import type { UserFormValues } from "./user-form.schema"

type PendingConfirmation =
  | { action: "reset-password"; user: ManagedUser }
  | { action: "toggle-active"; user: ManagedUser }

const UsersPage = () => {
  const { user } = useAuth()
  const [users, setUsers] = useState<ManagedUser[]>([])
  const [roles, setRoles] = useState<ManagedRole[]>([])
  const [loading, setLoading] = useState(true)
  const [working, setWorking] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<PendingConfirmation | null>(null)
  const [selectedUser, setSelectedUser] = useState<ManagedUser | null>(null)

  const canCreate = hasPermission(user, "users:create")
  const canUpdate = hasPermission(user, "users:update")
  const canToggleActive = hasPermission(user, "users:activate") || hasPermission(user, "users:deactivate")
  const canResetPassword = hasPermission(user, "users:reset_password")
  const canReadRoles = hasPermission(user, "roles:read")

  const loadUsers = useCallback(async () => {
    setLoading(true)
    try {
      setUsers(await usersService.list())
    } catch (error) {
      toast.error(
        "No se pudieron cargar los usuarios", 
        { description: getApiErrorMessage(error) }
      )
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    void usersService.list()
      .then((items) => { if (active) setUsers(items) })
      .catch((error: unknown) => { 
        if (active)
           toast.error(
            "No se pudieron cargar los usuarios",
           { description: getApiErrorMessage(error) }) 
      })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [])

  useEffect(() => {
    if (!canReadRoles) return
    let active = true
    void rolesService.list()
      .then((items) => { if (active) setRoles(items) })
      .catch((error: unknown) => { 
         if (active) 
          toast.error("No se pudieron cargar los roles",
         { description: getApiErrorMessage(error) }) 
      })
    return () => { active = false }
  }, [canReadRoles])

  const performAction = async (action: () => Promise<void>, successMessage: string): Promise<boolean> => {
    setWorking(true)
    try {
      await action()
      toast.success(successMessage)
      // Recarga la lista sin ocultar el resultado exitoso de la operación.
      setUsers(await usersService.list())
      return true
    } catch (error) {
      toast.error("No se pudo completar la operación", { description: getApiErrorMessage(error) })
      return false
    } finally {
      setWorking(false)
    }
  }

  const saveUser = async (values: UserFormValues) => {
    const editingUser = selectedUser
    setWorking(true)
    try {
      if (editingUser) {
        await usersService.updateManaged(editingUser.id, {
          firstName: values.firstName,
          lastName: values.lastName,
          username: values.username,
          email: values.email,
        })
        toast.success("Usuario actualizado correctamente.")
      } else {
        const result = await usersService.create({
          email: values.email,
          username: values.username,
          firstName: values.firstName || undefined,
          lastName: values.lastName || undefined,
          roleId: values.roleId,
        })
        showCredentialsToast(values.email, result.temporaryPassword)
      }
      setDialogOpen(false)
      setSelectedUser(null)
      try {
        setUsers(await usersService.list())
      } catch (error) {
        toast.error(
          "La operación se completó, pero no se pudo actualizar la lista", 
          { description: getApiErrorMessage(error) })
      }
    } catch (error) {
      toast.error(editingUser 
        ? "No se pudo actualizar el usuario" 
        : "No se pudo crear el usuario", 
        { description: getApiErrorMessage(error) })
    } finally {
      setWorking(false)
    }
  }

  const showCredentialsToast = (email: string, temporaryPassword: string) => {
    const credentials = `Correo: ${email}\nContraseña temporal: ${temporaryPassword}`
    toast.custom((id) => (
      <section 
        className="w-[min(420px,calc(100vw-2rem))] rounded-xl border border-border bg-background p-4 text-foreground shadow-lg">
        <div className="mb-3">
          <p className="font-semibold">Usuario creado correctamente</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Compartí estos datos de forma segura. Se solicitará cambiar la contraseña al ingresar.
          </p>
        </div>
        <div className="space-y-2 rounded-lg bg-muted/60 p-3 text-sm">
          <p className="flex items-start gap-2">
            <MailIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <span className="break-all">{email}</span>
          </p>
          <p className="flex items-start gap-2">
            <KeyRoundIcon className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
            <code className="break-all font-mono">{temporaryPassword}</code>
          </p>
        </div>
        <button
          type="button"
          className="mt-3 inline-flex h-9 w-full items-center
           justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium
            text-primary-foreground hover:bg-primary/90"
          onClick={() => {
            void navigator.clipboard.writeText(credentials).then(() => {
              toast.success("Correo y contraseña copiados")
              toast.dismiss(id)
            }).catch(() => 
              toast.error("No se pudo copiar. Seleccioná los datos y copialos manualmente.")
            )
          }}
        >
          <CopyIcon className="size-4" aria-hidden />Copiar correo y contraseña
        </button>
      </section>
    ), { duration: 15000 })
  }

  const confirmPendingAction = async () => {
    if (!pendingConfirmation) return
    const pending = pendingConfirmation
    if (pending.action === "toggle-active") {
      const activate = !pending.user.isActive
      const succeeded = await performAction(
        () => usersService.setActive(pending.user.id, activate),
        activate ? "Usuario activado." : "Usuario desactivado.",
      )
      if (succeeded) setPendingConfirmation(null)
      return
    }

    setWorking(true)
    try {
      const result = await usersService.resetPassword(pending.user.id)
      showCredentialsToast(pending.user.email, result.temporaryPassword)
      setPendingConfirmation(null)
    } catch (error) {
      toast.error("No se pudo restablecer la contraseña", { description: getApiErrorMessage(error) })
    } finally {
      setWorking(false)
    }
  }

  const openCreateDialog = () => {
    setSelectedUser(null)
    setDialogOpen(true)
  }

  const openEditDialog = (managedUser: ManagedUser) => {
    setSelectedUser(managedUser)
    setDialogOpen(true)
  }

  return (
    <div className="flex flex-col gap-5">
      <UsersToolbar
        loading={loading}
        working={working}
        canCreate={canCreate}
        onRefresh={() => void loadUsers()}
        onCreate={openCreateDialog}
      />

      <Card className="overflow-hidden pt-0">
        <CardContent className="p-0">
          <UsersTable
            users={users}
            roles={roles}
            loading={loading}
            authUser={user}
            canUpdate={canUpdate}
            canToggleActive={canToggleActive}
            canResetPassword={canResetPassword}
            working={working}
            onEdit={openEditDialog}
            onToggleActive={(managedUser) => setPendingConfirmation({ action: "toggle-active", user: managedUser })}
            onResetPassword={(managedUser) => setPendingConfirmation({ action: "reset-password", user: managedUser })}
          />
        </CardContent>
      </Card>

      {!canCreate && !canUpdate && !canToggleActive && !canResetPassword && (
        <p className="text-xs text-muted-foreground">Solo podés consultar los usuarios habilitados para tu cuenta.</p>
      )}

      <UserFormDialog
        open={dialogOpen}
        onOpenChange={(open) => {
          setDialogOpen(open)
          if (!open) setSelectedUser(null)
        }}
        user={selectedUser}
        roles={roles}
        canReadRoles={canReadRoles}
        working={working}
        onSave={saveUser}
      />
      <Dialog
        open={pendingConfirmation !== null} 
        onOpenChange={(open) => {
        if (!working && !open) setPendingConfirmation(null)
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingConfirmation?.action === "toggle-active"
              ? pendingConfirmation.user.isActive ? "Desactivar usuario" : "Activar usuario"
              : "Restablecer contraseña"}
            </DialogTitle>
            <DialogDescription>
              {pendingConfirmation?.action === "toggle-active"
                ? pendingConfirmation.user.isActive
                  ? <>¿Querés desactivar a <strong>{pendingConfirmation.user.username}</strong>? No podrá acceder mientras su cuenta esté inactiva.</>
                  : <>¿Querés activar a <strong>{pendingConfirmation.user.username}</strong>? Podrá volver a acceder al sistema.</>
                : <>¿Querés generar una contraseña temporal nueva para <strong>{pendingConfirmation?.user.username}</strong>? La contraseña actual dejará de ser válida y el usuario deberá cambiarla al ingresar.</>}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="outline" disabled={working} onClick={() => setPendingConfirmation(null)}>Cancelar</Button>
            <Button type="button" variant={pendingConfirmation?.action === "toggle-active" && pendingConfirmation.user.isActive ? "destructive" : "default"} disabled={working} onClick={() => void confirmPendingAction()}>
              {working ? "Procesando…" : pendingConfirmation?.action === "toggle-active"
                ? pendingConfirmation.user.isActive ? "Desactivar usuario" : "Activar usuario"
                : "Restablecer contraseña"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default UsersPage
