import { ArrowLeftIcon, FileDownIcon, PlusIcon } from "lucide-react"
import { Link } from "react-router"
import { Button } from "@/components/ui/button"
import AccommodationStatisticsPeriodFilters, { type StatisticsDateRange, type StatisticsPeriod } from "./AccommodationStatisticsPeriodFilters"

interface AccommodationStatisticsPageHeaderProps {
  accommodationId: string
  hideBackLink: boolean
  title: string
  description: string
  entryOnly: boolean
  canCreate: boolean
  showCreateAction?: boolean
  showPeriodFilters: boolean
  periodFilterLabel: string
  period: StatisticsPeriod
  range: StatisticsDateRange
  onPeriodChange: (period: StatisticsPeriod) => void
  onRangeChange: (range: StatisticsDateRange) => void
  onCreate: () => void
  showExportAction?: boolean
  onExport?: () => void
}

export default function AccommodationStatisticsPageHeader({
  accommodationId,
  hideBackLink,
  title,
  description,
  entryOnly,
  canCreate,
  showCreateAction = true,
  showPeriodFilters,
  periodFilterLabel,
  period,
  range,
  onPeriodChange,
  onRangeChange,
  onCreate,
  showExportAction = false,
  onExport,
}: AccommodationStatisticsPageHeaderProps) {
  return <>
    {!hideBackLink &&
      <Link to={`/alojamientos/${accommodationId}`}
        className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        <ArrowLeftIcon className="mr-2 size-4" />Volver al alojamiento
      </Link>}
    <header
      className="w-full flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-green-600 text-3xl font-semibold tracking-tight">
          {title}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}
        </p>
      </div>
      { entryOnly &&
        canCreate &&
        showCreateAction
        ? <Button className="cursor-pointer bg-green-600 p-4 hover:bg-green-700"
          size="lg" onClick={onCreate}>
          Nueva Estadística
          <PlusIcon className="ml-2 size-6" />
        </Button>
        : !entryOnly &&
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <AccommodationStatisticsPeriodFilters
            showPeriodFilters={showPeriodFilters}
            periodFilterLabel={periodFilterLabel}
            period={period} range={range}
            onPeriodChange={onPeriodChange}
            onRangeChange={onRangeChange} />
          {showExportAction &&
            onExport &&
            <Button type="button" size="sm"
              className="h-9 cursor-pointer uppercase text-green-950 bg-green-400 p-4 hover:bg-green-600 hover:text-white"
              onClick={onExport}>
              <FileDownIcon className="mr-2 size-4" />
              Exportar PDF
            </Button>}
        </div>}
    </header>
  </>
}
