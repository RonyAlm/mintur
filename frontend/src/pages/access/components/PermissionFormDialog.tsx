import { useMemo, useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { Permission } from "@/services/permissions.service"
import { humanizePermissionPart, KNOWN_PERMISSION_MODULES, PERMISSION_ACTIONS } from "../permission-options"

type PermissionFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSave: (name: string, description?: string) => Promise<void>
  working: boolean
  permissions: Permission[]
}

export function PermissionFormDialog({ open, onOpenChange, onSave, working, permissions }: PermissionFormDialogProps) {
  const [module, setModule] = useState("users")
  const [action, setAction] = useState("read")

  const modules = useMemo(() => {
    const keys = new Set(Object.keys(KNOWN_PERMISSION_MODULES))
    permissions.forEach(({ name }) => {
      const separator = name.lastIndexOf(":")
      if (separator > 0) keys.add(name.slice(0, separator))
    })
    return [...keys].sort((left, right) => (KNOWN_PERMISSION_MODULES[left] ?? left).localeCompare(KNOWN_PERMISSION_MODULES[right] ?? right, "es"))
  }, [permissions])

  const actions = useMemo(() => {
    const keys = new Set(Object.keys(PERMISSION_ACTIONS))
    permissions.forEach(({ name }) => {
      const separator = name.lastIndexOf(":")
      if (name.slice(0, separator) === module && separator >= 0) keys.add(name.slice(separator + 1))
    })
    return [...keys].sort((left, right) => (PERMISSION_ACTIONS[left] ?? left).localeCompare(PERMISSION_ACTIONS[right] ?? right, "es"))
  }, [module, permissions])

  const permissionName = `${module}:${action}`
  const alreadyExists = permissions.some((permission) => permission.name === permissionName)

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const values = new FormData(event.currentTarget)
    await onSave(permissionName, String(values.get("description") ?? "").trim() || undefined)
  }

  return (
    <Sheet open={open} onOpenChange={(next) => { if (!working) onOpenChange(next) }}>
      <SheetContent className="sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Crear permiso</SheetTitle>
          <SheetDescription>Elegí el módulo y la acción. La clave se arma automáticamente con el formato que acepta la API.</SheetDescription>
        </SheetHeader>
        <form id="permission-form" onSubmit={(event) => void submit(event)} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">Módulo
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={module} onChange={(event) => setModule(event.target.value)}>
                {modules.map((key) => <option key={key} value={key}>{KNOWN_PERMISSION_MODULES[key] ?? humanizePermissionPart(key)}</option>)}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-medium">Acción
              <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={action} onChange={(event) => setAction(event.target.value)}>
                {actions.map((key) => <option key={key} value={key}>{PERMISSION_ACTIONS[key] ?? humanizePermissionPart(key)}</option>)}
              </select>
            </label>
          </div>
          <div className="rounded-md border bg-muted/40 px-3 py-2.5"><span className="text-xs text-muted-foreground">Clave que se enviará</span><code className="mt-1 block text-sm font-medium">{permissionName}</code></div>
          {alreadyExists && <p role="status" className="text-sm text-destructive">Este permiso ya existe en el catálogo.</p>}
          <label className="grid gap-2 text-sm font-medium">Descripción<Input name="description" maxLength={255} placeholder="Consultar usuarios" /></label>
        </form>
        <SheetFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)} disabled={working}>Cancelar</Button>
          <Button type="submit" form="permission-form" disabled={working || alreadyExists}>Crear permiso</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
