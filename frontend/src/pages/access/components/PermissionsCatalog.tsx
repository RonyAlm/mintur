import { PlusIcon, SearchIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { Permission } from "@/services/permissions.service"

type PermissionsCatalogProps = {
  permissions: Permission[]
  loading: boolean
  query: string
  onQueryChange: (query: string) => void
  canCreate: boolean
  onCreate: () => void
}

export function PermissionsCatalog({ permissions, loading, query, onQueryChange, canCreate, onCreate }: PermissionsCatalogProps) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div><CardTitle>Catálogo de permisos</CardTitle><CardDescription>Capacidades disponibles para asignar a los roles.</CardDescription></div>
        {canCreate && <Button onClick={onCreate}><PlusIcon className="size-4" />Crear permiso</Button>}
      </CardHeader>
      {canCreate ? <CardContent className="p-0">
        <div className="flex flex-col gap-3 border-y p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">{loading ? "Cargando…" : `${permissions.length} ${permissions.length === 1 ? "permiso" : "permisos"}`}</p>
          <div className="relative w-full sm:max-w-xs"><SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden /><Input aria-label="Buscar permisos" placeholder="Buscar permisos…" value={query} onChange={(event) => onQueryChange(event.target.value)} className="pl-9" /></div>
        </div>
        <Table>
          <TableHeader><TableRow><TableHead className="pl-5">Permiso</TableHead><TableHead className="pr-5">Descripción</TableHead></TableRow></TableHeader>
          <TableBody>
            {loading ? <TableRow><TableCell colSpan={2} className="py-10 text-center text-muted-foreground">Cargando permisos…</TableCell></TableRow>
              : permissions.length === 0 ? <TableRow><TableCell colSpan={2} className="py-10 text-center text-muted-foreground">{query ? "No se encontraron permisos." : "No hay permisos disponibles."}</TableCell></TableRow>
                : permissions.map((permission) => <TableRow key={permission.id}><TableCell className="pl-5"><code className="text-sm">{permission.name}</code></TableCell><TableCell className="pr-5 text-muted-foreground">{permission.description || "Sin descripción"}</TableCell></TableRow>)}
          </TableBody>
        </Table>
      </CardContent> : <CardContent><p role="status" className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">No tenés permiso para crear permisos. El catálogo no está disponible para tu rol.</p></CardContent>}
    </Card>
  )
}
