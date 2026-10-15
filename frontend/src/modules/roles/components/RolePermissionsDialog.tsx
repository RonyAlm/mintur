import { useMemo, useState } from "react"
import { Trash2Icon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { type ManagedRole } from "@/modules/roles/api"
import type { Permission } from "@/modules/roles/api"

import {
  humanizePermissionPart,
  KNOWN_PERMISSION_MODULES,
  PERMISSION_ACTIONS,
  splitPermissionName,
} from "../permission-options"

type ComboboxOption = {
  value: string
  label: string
}

function getActionsForModule(
  permissions: Permission[],
  moduleKey: string,
): string[] {
  const actions = new Set<string>()

  permissions.forEach(({ name }) => {
    const parsed = splitPermissionName(name)

    if (parsed?.module === moduleKey) {
      actions.add(parsed.action)
    }
  })

  return [...actions].sort((left, right) =>
    (PERMISSION_ACTIONS[left] ?? left).localeCompare(
      PERMISSION_ACTIONS[right] ?? right,
      "es",
    ),
  )
}

interface RolePermissionsDialogProps {
  role: ManagedRole | null
  permissions: Permission[]
  open: boolean
  onOpenChange: (open: boolean) => void
  onAssign: (permissionId: string) => Promise<void>
  onRemove: (permissionId: string) => Promise<void>
  canManage: boolean
  working: boolean
}

export function RolePermissionsDialog({
  role,
  permissions,
  open,
  onOpenChange,
  onAssign,
  onRemove,
  canManage,
  working,
}: RolePermissionsDialogProps) {
  const [module, setModule] = useState("")
  const [action, setAction] = useState("")

  const hasPermissionDetails = role?.permissions != null

  const assigned = useMemo(() => {
    if (!role?.permissions) return []

    return role.permissions.map((item) => {
      const catalogPermission = permissions.find(
        (permission) =>
          permission.id === item.id ||
          permission.name === item.name,
      )

      return {
        permission: catalogPermission ?? item,
        canRemove: Boolean(catalogPermission),
      }
    })
  }, [role, permissions])

  const assignedIds = useMemo(
    () => new Set(assigned.map(({ permission }) => permission.id)),
    [assigned],
  )

  const moduleOptions = useMemo<ComboboxOption[]>(() => {
    const modules = new Set(
      permissions.flatMap((permission) => {
        const parsed = splitPermissionName(permission.name)
        return parsed ? [parsed.module] : []
      }),
    )

    return [...modules]
      .sort((left, right) =>
        (KNOWN_PERMISSION_MODULES[left] ?? left).localeCompare(
          KNOWN_PERMISSION_MODULES[right] ?? right,
          "es",
        ),
      )
      .map((key) => ({
        value: key,
        label:
          KNOWN_PERMISSION_MODULES[key] ??
          humanizePermissionPart(key),
      }))
  }, [permissions])

  const moduleActions = useMemo(
    () => getActionsForModule(permissions, module),
    [permissions, module],
  )

  const actionOptions = useMemo<ComboboxOption[]>(
    () =>
      moduleActions.map((key) => ({
        value: key,
        label: PERMISSION_ACTIONS[key] ?? humanizePermissionPart(key),
      })),
    [moduleActions],
  )

  const selectedModule =
    moduleOptions.find((option) => option.value === module) ?? null

  const selectedAction =
    actionOptions.find((option) => option.value === action) ?? null

  const selectedPermission = useMemo(
    () =>
      permissions.find((permission) => {
        const parsed = splitPermissionName(permission.name)

        return parsed?.module === module && parsed.action === action
      }),
    [permissions, module, action],
  )

  const isAlreadyAssigned = selectedPermission
    ? assignedIds.has(selectedPermission.id)
    : false

  const handleModuleChange = (option: ComboboxOption | null) => {
    const nextModule = option?.value ?? ""

    setModule(nextModule)

    const nextActions = getActionsForModule(permissions, nextModule)
    setAction(nextActions[0] ?? "")
  }

  const handleOpenChange = (nextOpen: boolean) => {
    if (working && !nextOpen) return

    if (!nextOpen) {
      setModule("")
      setAction("")
    }

    onOpenChange(nextOpen)
  }

  if (!role) return null

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent className="w-full overflow-y-auto p-6 sm:p-8">
        <SheetHeader>
          <SheetTitle className="text-lg font-bold">
            Permisos de {role.name}
          </SheetTitle>

          <SheetDescription>
            Asigná capacidades a este rol o quitá las que ya no correspondan.
          </SheetDescription>
        </SheetHeader>

        {!canManage ? (
          <p
            role="status"
            className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground"
          >
            No tenés autorización para gestionar asignaciones de permisos.
          </p>
        ) : (
          <div className="grid gap-6">
            <section className="grid gap-3">
              <h3 className="flex items-center gap-2 text-lg font-semibold">
                Permisos asignados
                <Badge variant="secondary">{assigned.length}</Badge>
              </h3>

              {!hasPermissionDetails ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  La respuesta de detalle del backend no incluye los permisos
                  asignados.
                </p>
              ) : assigned.length === 0 ? (
                <p className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  Este rol no tiene permisos asignados.
                </p>
              ) : (
                <ScrollArea className="h-60 w-full pr-4">
                  <ul className="divide-y rounded-lg border">
                    {assigned.map(({ permission, canRemove }) => (
                      <li
                        key={permission.id}
                        className="flex items-center justify-between gap-3 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <code className="block truncate text-sm">
                            {permission.name}
                          </code>

                          {!canRemove && (
                            <span className="text-xs text-muted-foreground">
                              No se encontró el permiso en el catálogo para
                              quitarlo.
                            </span>
                          )}
                        </div>

                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          aria-label={`Quitar permiso ${permission.name}`}
                          className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                          disabled={working || !canRemove}
                          onClick={() => void onRemove(permission.id)}
                        >
                          <Trash2Icon
                            className="size-4"
                            aria-hidden="true"
                          />
                        </Button>
                      </li>
                    ))}
                  </ul>
                </ScrollArea>
              )}
            </section>

            <section className="grid gap-3">
              <h3 className="text-lg font-semibold">
                Asignar permiso
              </h3>

              <div className="grid gap-3">
                <Combobox
                  items={moduleOptions}
                  value={selectedModule}
                  itemToStringValue={(option) => option.label}
                  onValueChange={handleModuleChange}
                >
                  <ComboboxInput
                    aria-label="Módulo del permiso"
                    className="w-full px-3 py-5"
                    placeholder="Buscar módulo…"
                    disabled={working}
                  />

                  <ComboboxContent className="w-full">
                    <ComboboxEmpty>
                      No se encontraron módulos.
                    </ComboboxEmpty>

                    <ComboboxList>
                      {(option) => (
                        <ComboboxItem
                          key={option.value}
                          value={option}
                        >
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                <Combobox
                  items={actionOptions}
                  value={selectedAction}
                  itemToStringValue={(option) => option.label}
                  onValueChange={(option) =>
                    setAction(option?.value ?? "")
                  }
                  disabled={!module || working}
                >
                  <ComboboxInput
                    aria-label="Acción del permiso"
                    className="w-full px-3 py-5"
                    placeholder="Buscar acción…"
                    disabled={!module || working}
                  />

                  <ComboboxContent className="w-full">
                    <ComboboxEmpty>
                      No se encontraron acciones para este módulo.
                    </ComboboxEmpty>

                    <ComboboxList>
                      {(option) => (
                        <ComboboxItem
                          key={option.value}
                          value={option}
                        >
                          {option.label}
                        </ComboboxItem>
                      )}
                    </ComboboxList>
                  </ComboboxContent>
                </Combobox>

                {selectedPermission && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Permiso seleccionado
                    </p>

                    <code className="mt-1 block break-all text-sm">
                      {selectedPermission.name}
                    </code>

                    {isAlreadyAssigned && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        Este permiso ya está asignado al rol.
                      </p>
                    )}
                  </div>
                )}

                <Button
                  type="button"
                  className="w-full"
                  disabled={
                    !selectedPermission ||
                    isAlreadyAssigned ||
                    working
                  }
                  onClick={() => {
                    if (selectedPermission) {
                      void onAssign(selectedPermission.id)
                    }
                  }}
                >
                  Asignar permiso
                </Button>
              </div>
            </section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  )
}
