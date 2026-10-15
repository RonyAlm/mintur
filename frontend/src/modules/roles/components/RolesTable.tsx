import {
  PencilIcon,
  SearchIcon,
  ShieldUserIcon,
  UsersRoundIcon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import type { ManagedRole } from "@/modules/roles/api"

interface RolesTableProps {
  roles: ManagedRole[]
  loading: boolean
  query: string
  onQueryChange: (query: string) => void
  canCreate: boolean
  canUpdate: boolean
  canManagePermissions: boolean
  onCreate: () => void
  onEdit: (role: ManagedRole) => void
  onManagePermissions: (role: ManagedRole) => void
}

export function RolesTable({
  roles,
  loading,
  query,
  onQueryChange,
  canCreate,
  canUpdate,
  canManagePermissions,
  onCreate,
  onEdit,
  onManagePermissions,
}: RolesTableProps) {
  const showActions = canUpdate || canManagePermissions

  const columnCount = showActions ? 4 : 3

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Roles</CardTitle>
          <CardDescription>
            Creá y editá roles y administrá sus permisos asignados.
          </CardDescription>
        </div>

        {canCreate && (
          <Button
            size="lg"
            onClick={onCreate}
            disabled={loading}
          >
            Crear rol
            <ShieldUserIcon className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
      </CardHeader>

      <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-y p-4 sm:flex-row sm:items-center sm:justify-between">
          <p
            className="text-sm text-muted-foreground"
            aria-live="polite"
          >
            {loading
              ? "Cargando roles…"
              : `${roles.length} ${roles.length === 1 ? "rol" : "roles"}`}
          </p>

          <div className="relative w-full sm:max-w-xs">
            <SearchIcon
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />

            <Input
              aria-label="Buscar roles"
              placeholder="Buscar roles…"
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="pl-5">Nombre</TableHead>
              <TableHead>Descripción</TableHead>
              <TableHead>Tipo</TableHead>

              {showActions && (
                <TableHead className="w-48 pr-5 text-right">
                  Acciones
                </TableHead>
              )}
            </TableRow>
          </TableHeader>

          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="py-10 text-center text-muted-foreground"
                >
                  Cargando roles…
                </TableCell>
              </TableRow>
            ) : roles.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columnCount}
                  className="py-10 text-center text-muted-foreground"
                >
                  {query.trim()
                    ? "No se encontraron roles."
                    : "No hay roles disponibles."}
                </TableCell>
              </TableRow>
            ) : (
              roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="pl-5 font-medium">
                    {role.name}
                  </TableCell>

                  <TableCell className="max-w-md truncate text-muted-foreground">
                    {role.description || "Sin descripción"}
                  </TableCell>

                  <TableCell>
                    {role.isSystemRole ? (
                      <Badge variant="secondary">Sistema</Badge>
                    ) : (
                      <Badge variant="outline">Personalizado</Badge>
                    )}
                  </TableCell>

                  {showActions && (
                    <TableCell className="pr-5">
                      <div className="flex justify-end gap-2">
                        {canUpdate && (
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Editar ${role.name}`}
                            onClick={() => onEdit(role)}
                            disabled={loading}
                          >
                            <PencilIcon
                              className="size-4"
                              aria-hidden="true"
                            />
                            <span className="hidden sm:inline">
                              Editar
                            </span>
                          </Button>
                        )}

                        {canManagePermissions && (
                          <Button
                            size="sm"
                            variant="outline"
                            aria-label={`Administrar permisos de ${role.name}`}
                            onClick={() => onManagePermissions(role)}
                            disabled={loading}
                          >
                            <UsersRoundIcon
                              className="size-4"
                              aria-hidden="true"
                            />
                            <span>Permisos</span>
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}