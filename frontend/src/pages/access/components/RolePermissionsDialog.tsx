import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { ManagedRole } from "@/services/roles.service"
import type { Permission } from "@/services/permissions.service"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { humanizePermissionPart, KNOWN_PERMISSION_MODULES, PERMISSION_ACTIONS, splitPermissionName } from "../permission-options"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Trash2Icon } from "lucide-react"

type ComboboxOption = { value: string; label: string }

type RolePermissionsDialogProps = {
  role: ManagedRole | null
  permissions: Permission[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (permissionId: string) => Promise<void>
  onRemove: (permissionId: string) => Promise<void>
  canManage: boolean
  working: boolean
}

export function RolePermissionsDialog({ role, permissions, open, onOpenChange, onAssign, onRemove, canManage, working }: RolePermissionsDialogProps) {
  const [module, setModule] = useState("")
  const [action, setAction] = useState("")
  if (!role) return null

  const assigned = role.permissions?.map((item) => {
    const catalogPermission = permissions.find((permission) => permission.id === item.id || permission.name === item.name)
    return { permission: catalogPermission ?? item, canRemove: Boolean(catalogPermission) }
  })
  const assignedIds = new Set(assigned?.map(({ permission }) => permission.id) ?? [])
  const permissionModules = [...new Set(permissions.flatMap((permission) => {
    const parsed = splitPermissionName(permission.name)
    return parsed ? [parsed.module] : []
  }))].sort((left, right) => (KNOWN_PERMISSION_MODULES[left] ?? left).localeCompare(KNOWN_PERMISSION_MODULES[right] ?? right, "es"))
  const moduleOptions: ComboboxOption[] = permissionModules.map((key) => ({
    value: key,
    label: KNOWN_PERMISSION_MODULES[key] ?? humanizePermissionPart(key),
  }))
  const moduleActions = [...new Set(permissions.flatMap((permission) => {
    const parsed = splitPermissionName(permission.name)
    return parsed?.module === module ? [parsed.action] : []
  }))].sort((left, right) => (PERMISSION_ACTIONS[left] ?? left).localeCompare(PERMISSION_ACTIONS[right] ?? right, "es"))
  const actionOptions: ComboboxOption[] = moduleActions.map((key) => ({
    value: key,
    label: PERMISSION_ACTIONS[key] ?? humanizePermissionPart(key),
  }))
  const selectedModule = moduleOptions.find((option) => option.value === module) ?? null
  const selectedAction = actionOptions.find((option) => option.value === action) ?? null
  const selectedPermission = permissions.find((permission) => {
    const parsed = splitPermissionName(permission.name)
    return parsed?.module === module && parsed.action === action
  })
  const isAlreadyAssigned = selectedPermission ? assignedIds.has(selectedPermission.id) : false

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full p-8 overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">Permisos de {role.name}</SheetTitle>
          <SheetDescription className="text-sm">Asigná capacidades a este rol o quitá las que ya no correspondan.</SheetDescription>
        </SheetHeader>
        {canManage ? <div className="grid gap-5">
          {assigned ? <section className="grid gap-2">
            <h3 className="text-lg font-semibold">Asignados <Badge variant="secondary">{assigned.length}</Badge></h3>
            {assigned.length ?
              <ScrollArea className="h-60 w-full pr-4">
               <ul className="divide-y rounded-lg border">
                {assigned.map(({ permission, canRemove }) =>
                   <li key={permission.id} className="flex items-center justify-between gap-3 px-3 py-2.5">
                    <div className="min-w-0"><code className="block truncate text-sm">{permission.name}</code>
                    {!canRemove && 
                     <span className="text-xs text-muted-foreground">No se encontró el ID en el catálogo para quitarlo.</span>}
                    </div>
                    <Button className="cursor-pointer text-destructive hover:bg-destructive/10 hover:text-destructive"
                       size="lg" variant="ghost" disabled={working || !canRemove} onClick={() => void onRemove(permission.id)}>
                      <Trash2Icon className="h-4 w-4" aria-hidden/>
                    </Button>
                  </li>)}
               </ul> 
               </ScrollArea>
               : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">Este rol no tiene permisos asignados.</p>}
          </section> : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">La respuesta de detalle del backend no incluye los permisos asignados.</p>}
          <section className="grid gap-2">
            <h3 className="text-lg font-semibold">Asignar permiso</h3>
            <div className="flex flex-wrap gap-4">
              <Combobox  
                items={moduleOptions}
                value={selectedModule}
                itemToStringValue={(option) => option.label}
                onValueChange={(option) => {
                  const nextModule = option?.value ?? ""
                  setModule(nextModule)
                  const firstAction = permissions.map((permission) => splitPermissionName(permission.name)).find((parsed) => parsed?.module === nextModule)?.action ?? ""
                  setAction(firstAction)
                }}
              >
                <ComboboxInput aria-label="Módulo del permiso" className="w-full px-2 py-6" placeholder="Buscar módulo…" />
                <ComboboxContent className="w-full">
                  <ComboboxEmpty>No se encontraron módulos.</ComboboxEmpty>
                  <ComboboxList >{(option) => 
                    <ComboboxItem className="w-full px-4 py-2" key={option.value} value={option}>{option.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <Combobox
                items={actionOptions}
                value={selectedAction}
                itemToStringValue={(option) => option.label}
                disabled={!module}
                onValueChange={(option) => setAction(option?.value ?? "")}
              >
                <ComboboxInput aria-label="Acción del permiso" className="w-full px-2 py-6" placeholder="Buscar acción…" disabled={!module} />
                <ComboboxContent className="w-full">
                  <ComboboxEmpty>No se encontraron acciones para este módulo.</ComboboxEmpty>
                  <ComboboxList>{(option) => 
                    <ComboboxItem className="w-full px-4 py-2" key={option.value} value={option}>{option.label}</ComboboxItem>}
                  </ComboboxList>
                </ComboboxContent>
              </Combobox>
              <Button
               className="w-full"
               size="lg"
               disabled={!selectedPermission || isAlreadyAssigned || working}
               onClick={() => selectedPermission && void onAssign(selectedPermission.id)}>
                Asignar
              </Button>
            </div>
            {selectedPermission && <p className="text-xs mt-4 text-muted-foreground">
              <strong className="font-semibold">Permiso: </strong> 
              <code>{selectedPermission.name}</code>
              {isAlreadyAssigned && " · Ya asignado a este rol"}</p>}
          </section>
        </div> : <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No tenés autorización para gestionar asignaciones de permisos.</p>}
      </SheetContent>
    </Sheet>
  )
}
