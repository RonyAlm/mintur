import { forwardRef, useImperativeHandle, useState } from "react"
import { useNavigate, useParams } from "react-router"
import { toast } from "sonner"
import { CalendarCheck2Icon, UsersIcon } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import AccommodationDailyStatisticForm from "../components/AccommodationDailyStatisticForm"
import AccommodationStatisticsEntryDashboard from "../components/statistics/AccommodationStatisticsEntryDashboard"
import AccommodationStatisticsPageHeader from "../components/statistics/AccommodationStatisticsPageHeader"
import AccommodationStatisticsRecordsTable from "../components/statistics/AccommodationStatisticsRecordsTable"
import AccommodationStatisticsReports from "../components/statistics/AccommodationStatisticsReports"
import type { StatisticsPeriod } from "../components/statistics/AccommodationStatisticsPeriodFilters"
import { useAccommodationStatistics } from "../hooks/useAccommodationStatistics"
import { useStatisticsPermissions } from "../hooks/useStatisticsPermissions"
import type { StatisticsView } from "./OrganizationStatisticsPage"
import type { AccommodationDailyStatistic } from "../types/accommodation-statistics.types"
import { exportAccommodationStatisticsToPdf } from "../utils/exportStatisticsPdf"

const RECORDS_PER_PAGE = 10

function toDateInputValue(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
}

function formatConfirmationDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

function getWeekRange(today: Date) {
  const from = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  from.setDate(from.getDate() - ((from.getDay() + 6) % 7))
  const to = new Date(from)
  to.setDate(to.getDate() + 6)
  return { from: toDateInputValue(from), to: toDateInputValue(to) }
}

function getMonthRange(today: Date) {
  return {
    from: toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)),
    to: toDateInputValue(new Date(today.getFullYear(), today.getMonth() + 1, 0)),
  }
}

function getYearRange(today: Date) {
  return { from: toDateInputValue(new Date(today.getFullYear(), 0, 1)), to: toDateInputValue(new Date(today.getFullYear(), 11, 31)) }
}

interface AccommodationStatisticsPageProps {
  accommodationId?: string
  hideBackLink?: boolean
  hideCreateAction?: boolean
  view?: StatisticsView
}

export interface AccommodationStatisticsPageHandle {
  openCreate: () => void
}

const AccommodationStatisticsPage = forwardRef<AccommodationStatisticsPageHandle, AccommodationStatisticsPageProps>(
  function AccommodationStatisticsPage({ accommodationId, hideBackLink = false, hideCreateAction = false, view }, ref) {
  const { id: routeId = "" } = useParams()
  const navigate = useNavigate()
  const id = accommodationId ?? routeId
  const [initialRange] = useState(() => {
    if (view === "entry") return getMonthRange(new Date())
    if (view === "records" || view === "reports") return getWeekRange(new Date())
    return undefined
  })
  const { range, setRange, summary, records, loading, error, reload } = useAccommodationStatistics(id, initialRange)
  const { canCreate, canUpdate } = useStatisticsPermissions()
  const queryClient = useQueryClient()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingRecord, setEditingRecord] = useState<AccommodationDailyStatistic | null>(null)
  const [createInitialDate, setCreateInitialDate] = useState<string | undefined>(undefined)

  useImperativeHandle(ref, () => ({
    openCreate: () => {
      setCreateInitialDate(undefined)
      setShowCreateForm(true)
    },
  }), [])
  const [recordsPage, setRecordsPage] = useState(1)
  const [dateSort, setDateSort] = useState<"asc" | "desc" | null>(null)
  const [recordsPeriod, setRecordsPeriod] = useState<StatisticsPeriod>(() => view === "records" || view === "reports" ? "week" : "custom")
  const entryOnly = view === "entry"
  const recordsOnly = view === "records"
  const reportsOnly = view === "reports"
  const sortedRecords = dateSort
    ? [...records].sort((left, right) => {
      const comparison = left.date.slice(0, 10).localeCompare(right.date.slice(0, 10))
      return dateSort === "asc" ? comparison : -comparison
    })
    : records
  const pageCount = Math.max(1, Math.ceil(records.length / RECORDS_PER_PAGE))
  const currentRecordsPage = Math.min(recordsPage, pageCount)
  const pageRecords = sortedRecords.slice((currentRecordsPage - 1) * RECORDS_PER_PAGE, currentRecordsPage * RECORDS_PER_PAGE)
  const today = new Date()
  const monthPrefix = toDateInputValue(new Date(today.getFullYear(), today.getMonth(), 1)).slice(0, 7)
  const monthRecords = records.filter((record) => record.date.slice(0, 7) === monthPrefix)
  const latestMonthlyRecord = [...monthRecords].sort((left, right) => right.date.localeCompare(left.date))[0]
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate()
  const monthProgress = Math.min(100, Math.round((monthRecords.length / daysInMonth) * 100))

  const selectRecordsPeriod = (period: StatisticsPeriod) => {
    setRecordsPeriod(period)
    setRecordsPage(1)
    if (period === "custom") return
    const currentDate = new Date()
    const nextRange = period === "week" ? getWeekRange(currentDate) : period === "month" ? getMonthRange(currentDate) : getYearRange(currentDate)
    if (nextRange.from !== range.from || nextRange.to !== range.to) setRange(nextRange)
  }

  const handleCreateForDate = (dateKey: string) => {
    setEditingRecord(null)
    setCreateInitialDate(dateKey)
    setShowCreateForm(true)
  }

  const handleViewRecord = (recordId: string) => {
    navigate(`/estadisticas/mis-registros/${encodeURIComponent(recordId)}?accommodationId=${encodeURIComponent(id)}`)
  }

  const handleExport = () => {
    if (!summary) return
    exportAccommodationStatisticsToPdf(summary, records, {
      range,
      title: "Reporte de estadísticas",
    })
  }

  return (
    <main className="mx-auto w-full space-y-6">
      <AccommodationStatisticsPageHeader
        accommodationId={id}
        hideBackLink={hideBackLink}
        title={entryOnly ? "Estadísticas diarias" : recordsOnly ? "Mis Registros" : reportsOnly ? "Reportes" : "Estadísticas del alojamiento"}
        description={entryOnly ? "Gestioná la información estadística de tu alojamiento." : recordsOnly ? "Historial de cargas diarias de tu alojamiento." : "Consulta la actividad y composición de los huéspedes."}
        entryOnly={entryOnly}
        canCreate={canCreate}
        showCreateAction={!hideCreateAction}
        showPeriodFilters={recordsOnly || reportsOnly}
        periodFilterLabel={reportsOnly ? "Filtrar reportes por período" : "Filtrar registros por período"}
        period={recordsPeriod}
        range={range}
        onPeriodChange={selectRecordsPeriod}
        onRangeChange={(nextRange) => {
          setRecordsPage(1)
          if (recordsOnly || reportsOnly) setRecordsPeriod("custom")
          setRange(nextRange)
        }}
        showExportAction={reportsOnly}
        onExport={handleExport}
        onCreate={() => {
          setCreateInitialDate(undefined)
          setShowCreateForm(true)
        }}
      />

      { entryOnly && 
        <AccommodationStatisticsEntryDashboard
           accommodationId={id}
            latestMonthlyRecord={latestMonthlyRecord}
            monthRecordsCount={monthRecords.length}
            daysInMonth={daysInMonth}
            monthProgress={monthProgress}
            onCreateForDate={canCreate ? handleCreateForDate : undefined}
            onViewRecord={handleViewRecord}
        />
      }

      <Dialog
       open={(showCreateForm && canCreate) || Boolean(editingRecord && canUpdate)} onOpenChange={(open) => {
        if (!open) { setShowCreateForm(false); setEditingRecord(null); setCreateInitialDate(undefined) }
      }}>
        <DialogContent className="max-h-[90vh] max-w-3xl p-0 pb-4 overflow-auto  scrollbar-thin">
          <DialogHeader className="flex flex-row items-center gap-4 border-b p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full p-4 bg-green-200/20 dark:bg-green-200/10">
              <CalendarCheck2Icon className="text-green-500 h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <DialogTitle>{editingRecord ? "Editar registro" : "Carga diaria de estadística"}</DialogTitle>
              <DialogDescription>Registra la información del día de tu Alojamiento.</DialogDescription>
            </div>
          </DialogHeader>
          <AccommodationDailyStatisticForm
            key={editingRecord?.id ?? createInitialDate ?? "new"}
            accommodationId={id}
            initialRecord={editingRecord ?? undefined}
            initialDate={editingRecord ? undefined : createInitialDate}
        onCancel={() => { setShowCreateForm(false); setEditingRecord(null); setCreateInitialDate(undefined) }}
        onCreated={(savedRecord) => {
          setShowCreateForm(false)
          setEditingRecord(null)
          setCreateInitialDate(undefined)
          toast.success("¡Registro guardado correctamente!", {
            description: `La información del ${formatConfirmationDate(savedRecord.date)} se ha guardado.`,
            classNames: {
              toast: "!border-border !bg-card !text-card-foreground !shadow-lg gap-4",
              title: "!font-semibold !text-foreground",
              description: "!text-muted-foreground",
              closeButton: "!border-border !bg-background !text-muted-foreground hover:!bg-accent hover:!text-accent-foreground",
            }
          })
          reload()
          void queryClient.invalidateQueries({ queryKey: ["accommodation-weekly-statistics", id] })
        }}
          />
        </DialogContent>
      </Dialog>

      {error && <Alert variant="destructive"><AlertTitle>No se pudieron cargar las estadísticas</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-3">{error}<Button variant="outline" size="sm" onClick={() => void reload()}>Reintentar</Button></AlertDescription></Alert>}

      {!entryOnly && (loading ? <div className="grid gap-4 sm:grid-cols-3"><Skeleton className="h-28" /><Skeleton className="h-28" /><Skeleton className="h-28" /></div> : summary && <>
        {!recordsOnly && <AccommodationStatisticsReports summary={summary} records={records} />}
        {records.length === 0 && <div className="rounded-xl border border-dashed p-8 text-center"><UsersIcon className="mx-auto size-8 text-muted-foreground" /><h2 className="mt-3 font-medium">{recordsOnly ? "No hay registros en este período" : "No hay estadísticas para este período"}</h2><p className="mt-1 text-sm text-muted-foreground">Prueba con otro rango de fechas o carga un registro diario.</p></div>}
        {(recordsOnly || !reportsOnly) && records.length > 0 && <AccommodationStatisticsRecordsTable
          records={pageRecords}
          totalRecords={records.length}
          pageSize={RECORDS_PER_PAGE}
          currentPage={currentRecordsPage}
          pageCount={pageCount}
          dateSort={dateSort}
          canUpdate={canUpdate}
          onSort={() => {
            setDateSort((current) => current === "asc" ? "desc" : "asc")
            setRecordsPage(1)
          }}
          onPageChange={setRecordsPage}
          onView={(record) => navigate(`/estadisticas/mis-registros/${encodeURIComponent(record.id)}?accommodationId=${encodeURIComponent(id)}`)}
          onEdit={(record) => {
            setShowCreateForm(false)
            setEditingRecord(record)
          }}
        />}
      </>) }
    </main>
  )
  }
)

export default AccommodationStatisticsPage
