import { useMemo } from "react"
import { createColumnHelper, useTable } from "@tanstack/react-table"
import { ArrowDownIcon, ArrowUpIcon, ChevronsUpDownIcon, MoreHorizontalIcon, RotateCcwKeyIcon, UserPenIcon, UserRoundCheckIcon, UserRoundIcon, UserRoundXIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { hasPermission } from "@/lib/modules"
import type { ManagedUser } from "@/modules/users/api/users.api"
import type { ManagedRole } from "@/modules/roles/api/roles.api"
import type { User } from "@/models/user.model"
import { usersTableFeatures } from "@/modules/users/components/users-table-features"

const columnHelper = createColumnHelper<typeof usersTableFeatures, ManagedUser>()

type UsersTableProps = {
  users: ManagedUser[]
  roles: ManagedRole[]
  loading: boolean
  authUser: User | null
  canUpdate: boolean
  canToggleActive: boolean
  canResetPassword: boolean
  working: boolean
  onEdit: (user: ManagedUser) => void
  onToggleActive: (user: ManagedUser) => void
  onResetPassword: (user: ManagedUser) => void
}

export function UsersTable({ users, roles, loading, authUser, canUpdate, canToggleActive, canResetPassword, working, onEdit, onToggleActive, onResetPassword }: UsersTableProps) {
  const columns = useMemo(() => columnHelper.columns([
    columnHelper.accessor((item) => `${[item.firstName, item.lastName].filter(Boolean).join(" ")} ${item.username}`.trim(), {
      id: "usuario",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Usuario {column.getIsSorted() === "asc" ? <ArrowUpIcon /> : column.getIsSorted() === "desc" ? <ArrowDownIcon /> : <ChevronsUpDownIcon />}
        </Button>
      ),
      cell: ({ row }) => {
        const item = row.original
        return <div className="min-w-40"><div className="font-medium">{[item.firstName, item.lastName].filter(Boolean).join(" ") || item.username}</div><div className="text-xs text-muted-foreground">@{item.username}</div></div>
      },
    }),
    columnHelper.accessor("email", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Correo electrónico {column.getIsSorted() === "asc" ? <ArrowUpIcon /> : column.getIsSorted() === "desc" ? <ArrowDownIcon /> : <ChevronsUpDownIcon />}
        </Button>
      ),
      cell: ({ getValue }) => <span className="text-muted-foreground">{getValue()}</span>,
    }),
    columnHelper.accessor((item) => roles.find((role) => role.id === item.roleId)?.name ?? "Rol no disponible", {
      id: "rol",
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Rol {column.getIsSorted() === "asc" ? <ArrowUpIcon /> : column.getIsSorted() === "desc" ? <ArrowDownIcon /> : <ChevronsUpDownIcon />}
        </Button>
      ),
      cell: ({ getValue }) => <Badge variant="secondary" className="font-mono text-xs">{getValue()}</Badge>,
    }),
    columnHelper.accessor("isActive", {
      header: ({ column }) => (
        <Button variant="ghost" size="sm" className="-ml-2" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Estado {column.getIsSorted() === "asc" ? <ArrowUpIcon /> : column.getIsSorted() === "desc" ? <ArrowDownIcon /> : <ChevronsUpDownIcon />}
        </Button>
      ),
      cell: ({ getValue }) => {
        const active = getValue()
        return <Badge variant={active ? "secondary" : "outline"} className={active ? "text-secondary-foreground" : "text-muted-foreground"}>{active ? "Activo" : "Inactivo"}</Badge>
      },
    }),
    columnHelper.display({
      id: "acciones",
      enableSorting: false,
      enableGlobalFilter: false,
      header: () => <span className="sr-only">Acciones</span>,
      cell: ({ row }) => {
        const item = row.original
        const canChangeActive = canToggleActive && hasPermission(authUser, item.isActive ? "users:deactivate" : "users:activate")
        return <div className="text-right"><DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Acciones para ${item.username}`} disabled={working}><MoreHorizontalIcon /></Button>} />
          <DropdownMenuContent className="w-52" align="end">
            {canUpdate && <DropdownMenuItem className="cursor-pointer" onClick={() => onEdit(item)}>Editar usuario<UserPenIcon className="ml-auto size-4" aria-hidden /></DropdownMenuItem>}
            {canChangeActive && <DropdownMenuItem className="cursor-pointer" onClick={() => onToggleActive(item)}>{item.isActive ? "Desactivar" : "Activar"}{item.isActive ? <UserRoundXIcon className="ml-auto size-4" aria-hidden /> : <UserRoundCheckIcon className="ml-auto size-4" aria-hidden />}</DropdownMenuItem>}
            {canResetPassword && <DropdownMenuItem className="cursor-pointer" onClick={() => onResetPassword(item)}>Restablecer contraseña<RotateCcwKeyIcon className="ml-auto size-4" aria-hidden /></DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu></div>
      },
    }),
  ]), [authUser, canResetPassword, canToggleActive, canUpdate, onEdit, onResetPassword, onToggleActive, roles, working])

  const table = useTable({
    features: usersTableFeatures,
    data: users,
    columns,
    initialState: { pagination: { pageIndex: 0, pageSize: 10 } },
    globalFilterFn: (row, _columnId, value) => {
      const item = row.original
      const search = String(value).trim().toLocaleLowerCase()
      return [item.firstName, item.lastName, item.username, item.email]
        .some((field) => field.toLocaleLowerCase().includes(search))
    },
  })

  const rows = table.getRowModel().rows
  const filteredCount = table.getFilteredRowModel().rows.length
  const pagination = table.state.pagination
  const pageCount = table.getPageCount()
  const firstItem = filteredCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const lastItem = Math.min((pagination.pageIndex + 1) * pagination.pageSize, filteredCount)

  const searchQuery = String(table.state.globalFilter ?? "").trim()

  return (
    <>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input aria-label="Buscar usuarios" placeholder="Buscar por nombre o correo…"
           value={searchQuery} 
           onChange={(event) => { table.setGlobalFilter(event.target.value); table.setPageIndex(0) }} className="pl-9" />
        </div>
      </div>

      {loading ? <div className="space-y-3 p-4">{Array.from({ length: 5 }, (_, index) => <Skeleton key={index} className="h-12 w-full" />)}</div>
        : rows.length === 0 ? 
        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
          <UserRoundIcon className="size-8 text-muted-foreground/60" aria-hidden />
          <p className="font-medium">
            { searchQuery ? "No se encontraron usuarios" : "No hay usuarios disponibles"}
          </p>
          <p className="text-sm text-muted-foreground">
            { searchQuery ? 
             `No hay coincidencias para “${searchQuery}”.` 
             : "Los resultados respetan el alcance autorizado por la API."}
          </p>
        </div>
          : <Table>
            <TableHeader>{table.getHeaderGroups().map((headerGroup) => <TableRow key={headerGroup.id} className="bg-muted/40 hover:bg-muted/40">
              {headerGroup.headers.map((header) => <TableHead key={header.id} className={header.id === "usuario" ? "pl-5" : header.id === "acciones" ? "w-14 pr-5 text-right" : ""}>
                {header.isPlaceholder ? null : <table.FlexRender header={header} />}
              </TableHead>)}
            </TableRow>)}</TableHeader>
            <TableBody>{rows.map((row) => <TableRow key={row.id}>
              {row.getAllCells().map((cell) => <TableCell key={cell.id} className={cell.column.id === "usuario" ? "py-3 pl-5" : cell.column.id === "acciones" ? "pr-5" : ""}>
                <table.FlexRender cell={cell} />
              </TableCell>)}
            </TableRow>)}</TableBody>
          </Table>}

      {filteredCount > 0 && <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
        <p className="text-muted-foreground" aria-live="polite">Mostrando <span className="font-medium text-foreground">{firstItem}–{lastItem}</span> de <span className="font-medium text-foreground">{filteredCount}</span> usuarios</p>
        <div className="flex flex-wrap items-center gap-3 sm:gap-5">
          <label className="flex items-center gap-2 whitespace-nowrap text-muted-foreground">Filas por página
            <select aria-label="Filas por página" value={pagination.pageSize} onChange={(event) => table.setPageSize(Number(event.target.value))} className="h-8 rounded-md border border-input bg-background px-2 text-foreground focus-visible:outline-2 focus-visible:outline-ring">
              {[10, 20, 50].map((size) => <option key={size} value={size}>{size}</option>)}
            </select>
          </label>
          <span className="whitespace-nowrap text-muted-foreground">Página {pagination.pageIndex + 1} de {pageCount}</span>
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon-sm" aria-label="Página anterior" disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}><ChevronLeftIcon aria-hidden /></Button>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Página siguiente" disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}><ChevronRightIcon aria-hidden /></Button>
          </div>
        </div>
      </div>}
    </>
  )
}
