
import { useMemo, useState } from "react"
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ChevronsUpDownIcon,
  CheckIcon,
  HotelIcon,
  SearchIcon,
  SlidersHorizontalIcon,
} from "lucide-react"
import { createColumnHelper, useTable } from "@tanstack/react-table"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { AccommodationType } from "../types/accommodation.types"
import type { Accommodation } from "../types/accommodation.types"


import { accommodationsTableFeatures } from "./accommodations-table-features"
import { AccommodationActionsMenu } from "./AccommodationActionsMenu"


const columnHelper = createColumnHelper<
  typeof accommodationsTableFeatures,
  Accommodation
>()

const accommodationTypeLabels: Record<AccommodationType, string> = {
  [AccommodationType.HOTEL]: "Hotel",
  [AccommodationType.APART_HOTEL]: "Apart hotel",
  [AccommodationType.HOSTEL]: "Hostel",
  [AccommodationType.OTHER]: "Otro",
}

type AccommodationsTableProps = {
  accommodations: Accommodation[]
  loading: boolean
  onSelect?: (accommodation: Accommodation) => void
  onEdit?: (accommodation: Accommodation) => void
  onToggleStatus?: (accommodation: Accommodation) => void
}

export function AccommodationsTable({
  accommodations,
  loading,
  onSelect,
  onEdit,
  onToggleStatus,
}: AccommodationsTableProps) {
  const [search, setSearch] = useState("")
  const [visibleColumns, setVisibleColumns] = useState<Record<string, boolean>>({
    totalRooms: false, totalBeds: false, email: false, website: false,
    phoneTwo: false, addressMap: false, instagram: false, facebook: false,
  })

  const columns = useMemo(
    () =>
      columnHelper.columns([
        columnHelper.accessor((row) => row.organization.name, {
          id: "name",
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Nombre
              {column.getIsSorted() === "asc" ? (
                <ArrowUpIcon />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDownIcon />
              ) : (
                <ChevronsUpDownIcon />
              )}
            </Button>
          ),
          cell: ({ getValue }) => <div className="min-w-40 font-medium">{getValue()}</div>,
        }),
        columnHelper.accessor("locality", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Localidad
              {column.getIsSorted() === "asc" ? (
                <ArrowUpIcon />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDownIcon />
              ) : (
                <ChevronsUpDownIcon />
              )}
            </Button>
          ),
          cell: ({ getValue }) => getValue() || "—",
        }),
        columnHelper.accessor("address", {
          header: "Dirección",
          cell: ({ getValue }) => getValue() || "—",
        }),
        columnHelper.accessor("type", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() =>
                column.toggleSorting(column.getIsSorted() === "asc")
              }
            >
              Tipo
              {column.getIsSorted() === "asc" ? (
                <ArrowUpIcon />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDownIcon />
              ) : (
                <ChevronsUpDownIcon />
              )}
            </Button>
          ),
          cell: ({ getValue }) => (
            <Badge variant="secondary">
              {accommodationTypeLabels[getValue()]}
            </Badge>
          ),
        }),
        columnHelper.accessor("capacity", {
          header: "Plazas",
          cell: ({ getValue }) => getValue() == null ? "—" : `${getValue()} plazas`,
        }),
        columnHelper.accessor("phoneOne", {
          header: "Teléfono principal",
          cell: ({ getValue }) => getValue() || "—",
        }),
        columnHelper.accessor("phoneTwo", { header: "Teléfono secundario", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("email", { header: "Correo electrónico", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("website", { header: "Sitio web", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("addressMap", { header: "Ubicación en mapa", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("instagram", { header: "Instagram", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("facebook", { header: "Facebook", cell: ({ getValue }) => getValue() || "—" }),
        columnHelper.accessor("totalRooms", {
          header: "Habitaciones",
          cell: ({ getValue }) => getValue() ?? "—",
        }),
        columnHelper.accessor("totalBeds", {
          header: "Camas",
          cell: ({ getValue }) => getValue() ?? "—",
        }),
        columnHelper.accessor("isActive", {
          header: ({ column }) => (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-2"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Estado
              {column.getIsSorted() === "asc" ? (
                <ArrowUpIcon />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDownIcon />
              ) : (
                <ChevronsUpDownIcon />
              )}
            </Button>
          ),
          cell: ({ getValue }) => {
            const active = getValue()

            return (
              <Badge
                variant={active ? "secondary" : "outline"}
                className={
                  active
                    ? "text-secondary-foreground"
                    : "text-muted-foreground"
                }
              >
                {active ? "Activo" : "Inactivo"}
              </Badge>
            )
          },
        }),
      ]),
    []
  )

  const table = useTable({
    features: accommodationsTableFeatures,
    data: accommodations,
    columns,
    initialState: {
      pagination: { pageIndex: 0, pageSize: 10 },
    },
    globalFilterFn: (row, _columnId, value) => {
      const query = String(value).trim().toLocaleLowerCase()
      const item = row.original

      return [
        item.organization.name,
        item.locality,
        item.address,
        accommodationTypeLabels[item.type],
      ].some((field) => field?.toLocaleLowerCase().includes(query))
    },
  })

  const filteredCount = table.getFilteredRowModel().rows.length
  const rows = table.getRowModel().rows
  const pagination = table.state.pagination
  const pageCount = table.getPageCount()
  const firstItem =
    filteredCount === 0 ? 0 : pagination.pageIndex * pagination.pageSize + 1
  const lastItem = Math.min(
    (pagination.pageIndex + 1) * pagination.pageSize,
    filteredCount
  )

  return (
    <>
      <div className="flex flex-col gap-3 border-b p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-xs">
          <SearchIcon
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden
          />
          <Input
            aria-label="Buscar alojamientos"
            placeholder="Buscar por localidad, dirección o tipo…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              table.setGlobalFilter(event.target.value)
              table.setPageIndex(0)
            }}
            className="pl-9"
          />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button type="button" variant="outline" className="shrink-0" />}>
            <SlidersHorizontalIcon className="mr-2 size-4" />
            Columnas
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="px-4 w-full max-h-80 overflow-y-auto">
            <DropdownMenuGroup>
              <DropdownMenuLabel className="py-4">Mostrar columnas</DropdownMenuLabel>
              {table.getAllLeafColumns().map((column) => (
                <DropdownMenuItem
                  key={column.id}
                  closeOnClick={false}
                  onClick={() => setVisibleColumns((current) => ({
                    ...current,
                    [column.id]: !(current[column.id] ?? true),
                  }))}
                >
                  <span className="flex w-full items-center gap-2">
                    <CheckIcon className={`size-4 ${visibleColumns[column.id] ?? true ? "opacity-100" : "opacity-0"}`} aria-hidden="true" />
                    {{name: "Nombre", locality: "Localidad", address: "Dirección", type: "Tipo", capacity: "Plazas", phoneOne: "Teléfono principal", totalRooms: "Habitaciones", totalBeds: "Camas", isActive: "Estado", phoneTwo: "Teléfono secundario", email: "Correo electrónico", website: "Sitio web", addressMap: "Ubicación en mapa", instagram: "Instagram", facebook: "Facebook"}[column.id] ?? column.id}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {loading ? (
        <div className="space-y-3 p-4">
          {Array.from({ length: 5 }, (_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <div className="flex flex-col items-center gap-2 px-4 py-14 text-center">
          <HotelIcon
            className="size-8 text-muted-foreground/60"
            aria-hidden
          />
          <p className="font-medium">
            {search.trim()
              ? "No se encontraron alojamientos"
              : "No hay alojamientos disponibles"}
          </p>
          <p className="text-sm text-muted-foreground">
            {search.trim()
              ? `No hay coincidencias para “${search.trim()}”.`
              : "Los alojamientos se mostrarán cuando estén disponibles para tu usuario."}
          </p>
        </div>
      ) : (
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow
                key={group.id}
                className="bg-muted/40 hover:bg-muted/40"
              >
                {group.headers.filter((header) => visibleColumns[header.id] ?? true).map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : <table.FlexRender header={header} />}
                  </TableHead>
                ))}
                {(onSelect || onEdit || onToggleStatus) && (
                  <TableHead className="w-20 text-right"></TableHead>
                )}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                {row.getAllCells().filter((cell) => visibleColumns[cell.column.id] ?? true).map((cell) => (
                  <TableCell key={cell.id} className="py-3">
                    <table.FlexRender cell={cell} />
                  </TableCell>
                ))}
                {(onSelect || onEdit || onToggleStatus) && (
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <AccommodationActionsMenu
                        accommodation={row.original}
                        onSelect={onSelect}
                        onEdit={onEdit}
                        onToggleStatus={onToggleStatus}
                      />
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {!loading && filteredCount > 0 && (
        <div className="flex flex-col gap-3 border-t px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground" aria-live="polite">
            Mostrando{" "}
            <span className="font-medium text-foreground">
              {firstItem}–{lastItem}
            </span>{" "}
            de{" "}
            <span className="font-medium text-foreground">
              {filteredCount}
            </span>{" "}
            alojamientos
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex items-center gap-2 text-muted-foreground">
              Filas por página
              <select
                aria-label="Filas por página"
                value={pagination.pageSize}
                onChange={(event) =>
                  table.setPageSize(Number(event.target.value))
                }
                className="h-8 rounded-md border border-input bg-background px-2 text-foreground"
              >
                {[10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>

            <span className="text-muted-foreground">
              Página {pagination.pageIndex + 1} de {pageCount}
            </span>

            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!table.getCanPreviousPage()}
                onClick={() => table.previousPage()}
              >
                Anterior
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={!table.getCanNextPage()}
                onClick={() => table.nextPage()}
              >
                Siguiente
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
