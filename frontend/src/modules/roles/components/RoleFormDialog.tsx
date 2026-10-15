import type { FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import type { ManagedRole } from "@/modules/roles/api";

type RoleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  role: ManagedRole | null
  onSave: (name: string, description?: string) => Promise<void>
  working: boolean
}

export function RoleFormDialog({ open, onOpenChange, role, onSave, working }: RoleFormDialogProps) {

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const form = event.currentTarget
    const values = new FormData(form)
    const name = String(values.get("name") ?? "").trim()
    const description =
      String(values.get("description") ?? "").trim() || undefined

    if (!name) {
      form.querySelector<HTMLInputElement>('input[name="name"]')?.focus()
      return
    }

    await onSave(name, description)
  }


  return (
    <Sheet open={open} onOpenChange={(next) => { if (!working) onOpenChange(next) }}>
      <SheetContent className="p-4">
        <SheetHeader className="p-0 pt-6">
          <SheetTitle className="text-2xl font-semibold">{role ? "Editar rol" : "Crear rol"}</SheetTitle>
          <SheetDescription>Definí el nombre y la descripción del rol.</SheetDescription>
        </SheetHeader>
        <form id="role-form" onSubmit={(event) => void submit(event)} className="grid gap-4">
          <label className="grid gap-2 text-sm font-medium">Nombre<Input name="name" required maxLength={100} defaultValue={role?.name ?? ""} autoFocus /></label>
          <label className="grid gap-2 text-sm font-medium">Descripción<Input name="description" maxLength={255} defaultValue={role?.description ?? ""} /></label>
          {role?.isSystemRole && <p className="text-sm text-muted-foreground">Este rol del sistema puede tener restricciones adicionales.</p>}
        </form>
        <SheetFooter>
          <Button size="lg" variant="outline" type="button"
            onClick={() => onOpenChange(false)} disabled={working}>
            Cancelar
          </Button>
          <Button size="lg" type="submit" form="role-form"
            disabled={working}>
            {role ? "Guardar cambios" : "Crear rol"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
