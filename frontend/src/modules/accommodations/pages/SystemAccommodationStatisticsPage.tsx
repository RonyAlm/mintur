import { useState } from "react"
import { useSearchParams } from "react-router"
import { useQuery } from "@tanstack/react-query"
import { FileDownIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import AccommodationStatisticsPeriodFilters, {
  type StatisticsPeriod,
} from "../components/statistics/AccommodationStatisticsPeriodFilters"
import AccommodationStatisticsReports from "../components/statistics/AccommodationStatisticsReports"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import { accommodationsApi } from "../api/accommodations.api"
import { useStatisticsPermissions } from "../hooks/useStatisticsPermissions"
import type { Accommodation } from "../types/accommodation.types"
import type { AllAccommodationsStatisticsSummary } from "../types/accommodation-statistics.types"
import { exportAccommodationStatisticsToPdf } from "../utils/exportStatisticsPdf"
import { getPeriodRange, getWeekRange } from "../utils/statisticsPeriods"
import AccommodationStatisticsPage from "./AccommodationStatisticsPage"
import type { StatisticsView } from "./OrganizationStatisticsPage"

type SystemStatisticsView = Extract<StatisticsView, "records" | "reports">

interface SystemAccommodationStatisticsPageProps {
  view?: SystemStatisticsView
}

function formatAccommodationLabel(accommodation: Accommodation) {
  const locality = accommodation.locality ? ` — ${accommodation.locality}` : ""
  return `${accommodation.organization.name}${locality}`
}

export default function SystemAccommodationStatisticsPage({
  view = "reports",
}: SystemAccommodationStatisticsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [period, setPeriod] = useState<StatisticsPeriod>("week")
  const [range, setRange] = useState(() => getWeekRange(new Date()))
  const { isSystemRole, isSystemRoleLoading } = useStatisticsPermissions()

  const requestedId = searchParams.get("accommodationId")
  const supportsAllScope = view === "reports"
  const {
    data: accommodations = [],
    isLoading: accommodationsLoading,
    isError: accommodationsError,
    refetch: reloadAccommodations,
  } = useQuery({
    queryKey: ["system-accommodations"],
    queryFn: () => accommodationsApi.list(),
    enabled: !isSystemRoleLoading && isSystemRole,
    retry: false,
  })
  const selectedId = requestedId && (accommodationsLoading || accommodations.some(({ id }) => id === requestedId))
    ? requestedId
    : supportsAllScope ? "all" : accommodations[0]?.id ?? ""
  const isDateRangeInvalid = !range.from || !range.to || range.from > range.to
  const allSummaryQuery = useQuery<AllAccommodationsStatisticsSummary>({
    queryKey: ["accommodation-statistics", "all-summary", range.from, range.to],
    queryFn: () => accommodationStatisticsApi.getAllSummary(range.from, range.to),
    enabled: !isSystemRoleLoading && isSystemRole && supportsAllScope
      && selectedId === "all" && !isDateRangeInvalid,
    retry: false,
  })

  const handleAccommodationChange = (nextId: string | null) => {
    if (!nextId) return
    setSearchParams((current) => {
      const next = new URLSearchParams(current)
      if (nextId && nextId !== "all") next.set("accommodationId", nextId)
      else next.delete("accommodationId")
      return next
    })
  }

  const handlePeriodChange = (nextPeriod: StatisticsPeriod) => {
    setPeriod(nextPeriod)
    if (nextPeriod === "custom") return
    setRange(getPeriodRange(nextPeriod))
  }

  const handleExportAll = () => {    if (!allSummaryQuery.data) return
    exportAccommodationStatisticsToPdf(allSummaryQuery.data, [], {
      range,
      title: "Reporte de estadísticas",
      fileName: "reporte-estadisticas-todos-los-alojamientos",
      scopeLabel: "Todos los alojamientos",
    })
  }

  if (isSystemRoleLoading) {
    return <div role="status" aria-label="Verificando permisos"><Skeleton className="h-12 w-full" /></div>
  }

  if (!isSystemRole) {
    return <Alert variant="destructive">
      <AlertTitle>Acceso denegado</AlertTitle>
      <AlertDescription>Esta página solo está disponible para usuarios de sistema.</AlertDescription>
    </Alert>
  }

  const title = view === "records" ? "Registros diarios" : "Reportes"

  return <main className="mx-auto w-full max-w-6xl space-y-6">
    <header className="space-y-2">
      <h1 className="text-3xl font-semibold tracking-tight text-green-600">{title}</h1>
      <p className="text-sm text-muted-foreground">
        {supportsAllScope
          ? "Consulta las estadísticas de todos los alojamientos o selecciona uno en particular."
          : "Selecciona un alojamiento para consultar sus estadísticas."}
      </p>
    </header>

    <div className="flex flex-wrap items-end gap-4">
      <label className="grid max-w-xl flex-1 gap-2 text-sm font-medium">
        Alojamiento
        <Select value={selectedId} onValueChange={handleAccommodationChange}>
          <SelectTrigger aria-label="Alojamiento" className="h-10 w-full">
            <SelectValue placeholder="Seleccionar alojamiento">
              {(value) => {
                if (value === "all") return "Todos los alojamientos"
                const selectedAccommodation = accommodations.find(({ id }) => id === value)
                return selectedAccommodation
                  ? formatAccommodationLabel(selectedAccommodation)
                  : "Seleccionar alojamiento"
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            {supportsAllScope && <SelectItem value="all">Todos los alojamientos</SelectItem>}
            {accommodations.map((accommodation) => (
              <SelectItem key={accommodation.id} value={accommodation.id}>
                {formatAccommodationLabel(accommodation)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </label>

      {supportsAllScope && selectedId === "all" && <div className="flex flex-wrap items-end gap-3">
        <AccommodationStatisticsPeriodFilters
          showPeriodFilters
          periodFilterLabel="Filtrar reportes por período"
          period={period}
          range={range}
          onPeriodChange={handlePeriodChange}
          onRangeChange={(nextRange) => {
            setPeriod("custom")
            setRange(nextRange)
          }}
        />
        {view === "reports" && allSummaryQuery.data && <Button type="button" size="sm"
          className="h-10 cursor-pointer uppercase text-green-950 bg-green-400 p-4 hover:bg-green-600 hover:text-white"
          onClick={handleExportAll}>
          <FileDownIcon className="mr-2 size-4" />
          Exportar PDF
        </Button>}
      </div>}
    </div>

    {accommodationsLoading && <div role="status" aria-label="Cargando alojamientos"><Skeleton className="h-12 w-full" /></div>}
    {accommodationsError && <Alert variant="destructive">
      <AlertTitle>No se pudieron cargar los alojamientos</AlertTitle>
      <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
        Inténtalo nuevamente.
        <Button variant="outline" size="sm" onClick={() => void reloadAccommodations()}>
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>}
    {!accommodationsLoading && !accommodationsError && accommodations.length === 0 && !supportsAllScope && (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hay alojamientos disponibles para consultar.
      </p>
    )}
    {!accommodationsLoading && !accommodationsError && accommodations.length === 0 && supportsAllScope && selectedId !== "all" && (
      <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">
        No hay alojamientos disponibles para consultar.
      </p>
    )}

    {supportsAllScope && selectedId === "all" && <>
      {isDateRangeInvalid && <Alert variant="destructive">
        <AlertTitle>Rango de fechas inválido</AlertTitle>
        <AlertDescription>{!range.from || !range.to ? "Completa las fechas de inicio y fin." : "La fecha de inicio no puede ser posterior a la fecha de fin."}</AlertDescription>
      </Alert>}
      {allSummaryQuery.isLoading && !isDateRangeInvalid && <div role="status" aria-label="Cargando resumen"><Skeleton className="h-28 w-full" /></div>}
      {allSummaryQuery.isError && !isDateRangeInvalid && <Alert variant="destructive">
        <AlertTitle>No se pudo cargar el resumen global</AlertTitle>
        <AlertDescription>
          Inténtalo nuevamente.
          <Button type="button" variant="link" size="sm" onClick={() => void allSummaryQuery.refetch()}>
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>}
      {allSummaryQuery.data && !allSummaryQuery.isLoading && <AccommodationStatisticsReports summary={allSummaryQuery.data} records={[]} />}
    </>}

    {selectedId && selectedId !== "all" && !accommodationsLoading && !accommodationsError && (
      <AccommodationStatisticsPage
        key={`${selectedId}:${view}`}
        accommodationId={selectedId}
        hideBackLink
        hideCreateAction
        view={view}
      />
    )}
  </main>
}
