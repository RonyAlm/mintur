import { ArrowDownIcon, ArrowUpDownIcon, ArrowUpIcon, ChevronLeftIcon, ChevronRightIcon, EyeIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { AccommodationDailyStatistic } from "../../types/accommodation-statistics.types"

interface AccommodationStatisticsRecordsTableProps {
  records: AccommodationDailyStatistic[]
  totalRecords: number
  pageSize: number
  currentPage: number
  pageCount: number
  dateSort: "asc" | "desc" | null
  canUpdate: boolean
  onSort: () => void
  onPageChange: (page: number) => void
  onView: (record: AccommodationDailyStatistic) => void
  onEdit: (record: AccommodationDailyStatistic) => void
}

export default function AccommodationStatisticsRecordsTable({
  records,
  totalRecords,
  pageSize,
  currentPage,
  pageCount,
  dateSort,
  canUpdate,
  onSort,
  onPageChange,
  onView,
  onEdit,
}: AccommodationStatisticsRecordsTableProps) {
  return <Card>
    <CardHeader>
      <CardTitle>Mis Registros</CardTitle>
      <CardDescription className="text-sm text-muted-foreground">
        Historial de cargas diarias en el período seleccionado.
      </CardDescription>
    </CardHeader>
    <CardContent>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead aria-sort={dateSort === "asc" ? "ascending" : dateSort === "desc" ? "descending" : "none"}>
                <Button type="button" variant="ghost" size="sm" className="-ml-2" aria-label={dateSort ? `Ordenar por fecha (${dateSort === "asc" ? "ascendente" : "descendente"})` : "Ordenar por fecha"} onClick={onSort}>
                  Fecha{dateSort === "asc" ? <ArrowUpIcon className="ml-2 size-4" aria-hidden="true" /> : dateSort === "desc" ? <ArrowDownIcon className="ml-2 size-4" aria-hidden="true" /> : <ArrowUpDownIcon className="ml-2 size-4" aria-hidden="true" />}
                </Button>
              </TableHead>
              <TableHead className="text-right">Huéspedes</TableHead><TableHead>Estado</TableHead><TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>{records.map((record) => {
            const formattedDate = new Date(`${record.date.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR")
            return <TableRow key={record.id}>
              <TableCell>{formattedDate}</TableCell>
              <TableCell className="text-right tabular-nums">{record.totalGuests.toLocaleString("es-AR")}</TableCell>
              <TableCell>
                <span
                  className="inline-flex rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                  Completada
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button aria-label={`Ver registro del ${formattedDate}`} size="sm" variant="outline" onClick={() => onView(record)}><EyeIcon className="mr-1 size-4" />Ver</Button>
                  {canUpdate && <Button size="sm" variant="outline" onClick={() => onEdit(record)}>Editar</Button>}
                </div>
              </TableCell>
            </TableRow>
          })}</TableBody>
        </Table>
      </div>
      <nav aria-label="Paginación de registros" className="mt-4 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">Mostrando {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, totalRecords)} de {totalRecords} registros</p>
        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}><ChevronLeftIcon className="size-4" />Anterior</Button>
          <span aria-live="polite" className="min-w-24 text-center text-sm font-medium">Página {currentPage} de {pageCount}</span>
          <Button variant="outline" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === pageCount}>Siguiente<ChevronRightIcon className="size-4" /></Button>
        </div>
      </nav>
    </CardContent>
  </Card>
}
