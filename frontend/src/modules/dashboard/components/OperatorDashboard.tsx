import { Link } from "react-router"
import { CalendarPlusIcon } from "lucide-react"

import { useAuth } from "@/modules/auth/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { getDisplayName } from "@/lib/user"
import { useStatisticsPermissions } from "@/modules/accommodations/hooks/useStatisticsPermissions"
import DashboardHeader from "./DashboardHeader"
import StatCard from "./StatCard"
import WeeklyLoadStatus from "./WeeklyLoadStatus"
import { useOperatorDashboard } from "../hooks/useOperatorDashboard"
import { accommodationDisplayName } from "../utils/dashboard.utils"

const today = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date())

export default function OperatorDashboard() {
  const { user } = useAuth()
  const { canCreate } = useStatisticsPermissions()
  useDocumentTitle("Inicio")

  const {
    accommodations,
    selectedAccommodation,
    setSelectedId,
    loading,
    error,
    reload,
    daysWithLoad,
    visitorsInMonth,
    originPlaces,
  } = useOperatorDashboard()

  const accommodationId = selectedAccommodation?.id ?? ""
  const entryPath = `/estadisticas/carga-diaria?accommodationId=${encodeURIComponent(accommodationId)}`

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        greeting={`Hola, ${getDisplayName(user)}`}
        accommodationName={selectedAccommodation ? accommodationDisplayName(selectedAccommodation) : undefined}
        right={<span className="text-sm font-medium text-muted-foreground">{today}</span>}
      />

      {accommodations.length > 1 && (
        <label className="grid w-fit gap-2 text-sm font-medium">
          Alojamiento
          <Select
            value={accommodationId}
            onValueChange={(nextId) => {
              if (nextId) setSelectedId(nextId)
            }}
          >
            <SelectTrigger aria-label="Alojamiento" className="h-10 w-full min-w-64">
              <SelectValue>
                {(value) => {
                  const selected = accommodations.find((item) => item.id === value)
                  return selected ? accommodationDisplayName(selected) : "Seleccionar alojamiento"
                }}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {accommodations.map((accommodation) => (
                <SelectItem key={accommodation.id} value={accommodation.id}>
                  {accommodationDisplayName(accommodation)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </label>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar las estadísticas</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            {error}
            <Button variant="outline" size="sm" onClick={() => void reload()}>
              Reintentar
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {!loading && !selectedAccommodation && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="font-medium">No tienes alojamientos asignados.</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cuando formes parte de una organización con alojamiento, su actividad aparecerá aquí.
          </p>
        </div>
      )}

      {selectedAccommodation && canCreate && (
        <div>
          <Button size="lg" className="bg-green-600 hover:bg-green-700" render={<Link to={entryPath} />}>
            <CalendarPlusIcon className="mr-2 size-5" aria-hidden="true" />
            Nueva carga diaria
          </Button>
        </div>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        selectedAccommodation && (
          <section aria-label="Indicadores del mes" className="grid gap-4 sm:grid-cols-3">
            <StatCard
              label="Días con carga en el mes"
              value={daysWithLoad.toLocaleString("es-AR")}
              icon="calendar"
            />
            <StatCard
              label="Visitantes registrados en el mes"
              value={visitorsInMonth.toLocaleString("es-AR")}
              icon="users"
            />
            <StatCard
              label="Lugares de origen en el mes"
              value={originPlaces.toLocaleString("es-AR")}
              description="Provincias o países"
              icon="globe"
            />
          </section>
        )
      )}

      {accommodationId && <WeeklyLoadStatus accommodationId={accommodationId} />}
    </div>
  )
}
