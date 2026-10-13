import { useEffect, useState, type FormEvent } from "react"
import { Loader2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { ManagedUser } from "@/services/users.service"
import type { ManagedRole } from "@/services/roles.service"
import { userFormSchema, type UserFormValues } from "./user-form.schema"

type UserFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: ManagedUser | null
  roles: ManagedRole[]
  canReadRoles: boolean
  working: boolean
  onSave: (values: UserFormValues) => Promise<void>
}

const emptyValues: UserFormValues = { email: "", username: "", firstName: "", lastName: "", roleId: "" }

export function UserFormDialog({ open, onOpenChange, user, roles, canReadRoles, working, onSave }: UserFormDialogProps) {
  const [values, setValues] = useState<UserFormValues>(emptyValues)
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormValues, string>>>({})

  useEffect(() => {
    if (!open) return
    // Reinicializa el formulario al abrir o cambiar el usuario seleccionado.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setValues({ ...emptyValues, email: user?.email ?? "", username: user?.username ?? "", firstName: user?.firstName ?? "", lastName: user?.lastName ?? "" })
    setErrors({})
  }, [open, user])

  const updateField = (field: keyof UserFormValues, value: string) => {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => ({ ...current, [field]: undefined }))
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const result = userFormSchema.safeParse(values)
    if (!result.success) {
      const validationErrors: Partial<Record<keyof UserFormValues, string>> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0] as keyof UserFormValues
        validationErrors[field] = issue.message
      }
      setErrors(validationErrors)
      return
    }
    if (!user && !result.data.roleId) {
      setErrors({ roleId: "Seleccioná un rol." })
      return
    }
    await onSave(result.data)
  }

  const renderField = (name: "firstName" | "lastName" | "username" | "email", label: string, type = "text") => (
    <div className="space-y-1.5" key={name}>
      <Label htmlFor={`user-${name}`}>{label}{!user && name !== "firstName" && name !== "lastName" ? " *" : ""}</Label>
      <Input
        id={`user-${name}`}
        type={type}
        required={!user && (name === "email" || name === "username")}
        minLength={name === "username" ? 3 : undefined}
        value={values[name]}
        aria-invalid={Boolean(errors[name])}
        aria-describedby={errors[name] ? `user-${name}-error` : undefined}
        onChange={(event) => updateField(name, event.target.value)}
      />
      {errors[name] && <p id={`user-${name}-error`} className="text-xs text-destructive">{errors[name]}</p>}
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => { if (!working) onOpenChange(nextOpen) }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{user ? "Editar usuario" : "Crear usuario"}</DialogTitle>
          <DialogDescription>{user ? "Actualizá los datos de la cuenta." : "Completá los datos para dar de alta una cuenta."}</DialogDescription>
        </DialogHeader>
        <form id="user-form" onSubmit={(event) => void handleSubmit(event)} className="grid gap-4 sm:grid-cols-2">
          {renderField("firstName", "Nombre")}
          {renderField("lastName", "Apellido")}
          {renderField("username", "Nombre de usuario")}
          {renderField("email", "Correo electrónico", "email")}
          {!user && canReadRoles && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="user-role">Rol *</Label>
              <select id="user-role" value={values.roleId} required onChange={(event) => updateField("roleId", event.target.value)} aria-invalid={Boolean(errors.roleId)} className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm">
                <option value="">Seleccioná un rol</option>
                {roles.map((role) => <option key={role.id} value={role.id}>{role.name}</option>)}
              </select>
              {errors.roleId && <p className="text-xs text-destructive">{errors.roleId}</p>}
            </div>
          )}
          {!user && !canReadRoles && <p className="text-sm text-muted-foreground sm:col-span-2">Necesitás el permiso roles:read para asignar un rol y crear usuarios.</p>}
        </form>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={working}>Cancelar</Button>
          <Button type="submit" form="user-form" disabled={working || (!user && (!canReadRoles || roles.length === 0))}>
            {working && <Loader2Icon className="animate-spin" aria-hidden />}{user ? "Guardar cambios" : "Crear usuario"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
