import { useCallback, useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import { useStatisticsPermissions } from "../hooks/useStatisticsPermissions"
import type { Accommodation } from "../types/accommodation.types"
import AccommodationStatisticsPage, { type AccommodationStatisticsPageHandle } from "./AccommodationStatisticsPage"
import { PlusIcon, RefreshCwIcon } from "lucide-react"

export type StatisticsView = "entry" | "records" | "reports"

interface OrganizationStatisticsPageProps {
  view?: StatisticsView
}

function accommodationLabel(accommodation: Accommodation) {
  const locality = accommodation.locality ? ` — ${accommodation.locality}` : ""
  return `${accommodation.organization.name}${locality}`
}

export default function OrganizationStatisticsPage({ view = "reports" }: OrganizationStatisticsPageProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const [accommodations, setAccommodations] = useState<Accommodation[]>([])
  const [selectedId, setSelectedId] = useState(() => searchParams.get("accommodationId") ?? "")
  const selectedIdRef = useRef(selectedId)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const createFormRef = useRef<AccommodationStatisticsPageHandle>(null)
  const { canCreate } = useStatisticsPermissions()

  const loadAccommodations = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const results = await accommodationStatisticsApi.listMemberAccommodations()
      setAccommodations(results)
      const nextId = results.some((item) => item.id === selectedIdRef.current) ? selectedIdRef.current : results[0]?.id ?? ""
      setSelectedId(nextId)
      selectedIdRef.current = nextId
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (nextId) next.set("accommodationId", nextId)
        else next.delete("accommodationId")
        return next
      }, { replace: true })
    } catch {
      setError("No se pudieron cargar tus alojamientos. Inténtalo nuevamente.")
    } finally {
      setLoading(false)
    }
  }, [setSearchParams])

  useEffect(() => {
    let active = true
    accommodationStatisticsApi.listMemberAccommodations().then((results) => {
      if (!active) return
      setAccommodations(results)
      const nextId = results.some((item) => item.id === selectedIdRef.current) ? selectedIdRef.current : results[0]?.id ?? ""
      selectedIdRef.current = nextId
      setSelectedId(nextId)
      setSearchParams((current) => {
        const next = new URLSearchParams(current)
        if (nextId) next.set("accommodationId", nextId)
        else next.delete("accommodationId")
        return next
      }, { replace: true })
    }).catch(() => {
      if (active) setError("No se pudieron cargar tus alojamientos. Inténtalo nuevamente.")
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [setSearchParams])

  const selectedAccommodation = accommodations.find((item) => item.id === selectedId)

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6">
      {!loading && !selectedAccommodation && 
      <header className="space-y-2">
        <h1 className="text-3xl font-semibold tracking-tight">
          {view === "entry" ? "Carga diaria" : view === "records" ? "Mis Registros" : "Reportes"}</h1>
        <p className="text-sm text-muted-foreground">
          { view === "entry" 
            ? "Registra la actividad diaria de tu alojamiento." 
            : view === "records" 
              ? "Consulta y edita las cargas anteriores." 
              : "Analiza la actividad estadística de tu alojamiento."
          }
        </p>
      </header>}

      {loading && <div role="status" aria-label="Cargando alojamientos">
      <Skeleton className="h-12 w-full max-w-xl" /></div>}
      {error && <Alert variant="destructive">
        <AlertTitle>No se pudieron cargar los alojamientos</AlertTitle>
        <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
          {error}
          <Button variant="outline" size="sm" onClick={() => void loadAccommodations()}>
            Reintentar
          </Button>
        </AlertDescription>
        </Alert>}

      {!loading && !error && accommodations.length === 0 && (
        <div className="rounded-xl border border-dashed p-8 text-center">
          <h2 className="font-medium">No tienes alojamientos asignados.</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cuando formes parte de una organización, sus alojamientos aparecerán aquí.</p>
        </div>
      )}

      {!loading && !error && accommodations.length > 0 && <>
        <div className="flex justify-between flex-wrap items-center gap-4">
          <label className="grid max-w-xl gap-2 text-sm font-medium">
            Alojamiento
            <Select
              disabled={accommodations.length <= 1}
              value={selectedId}
              onValueChange={(nextId) => {
                if (!nextId) return
                setSelectedId(nextId)
                selectedIdRef.current = nextId

                setSearchParams((current) => {
                  const next = new URLSearchParams(current)
                  next.set("accommodationId", nextId)
                  return next
                })
              }}
            >
              <SelectTrigger
                aria-label="Alojamiento"
                className="h-10 w-full"
              >
                <SelectValue>
                  {(value) => {
                    const selected = accommodations.find((item) => item.id === value)
                    return selected ? accommodationLabel(selected) : "Seleccionar alojamiento"
                  }}
                </SelectValue>
              </SelectTrigger>

              <SelectContent>
                {accommodations.map((accommodation) => (
                  <SelectItem
                    key={accommodation.id}
                    value={accommodation.id}
                  >
                    {accommodationLabel(accommodation)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </label>
         
          <div className="flex gap-2">
            <Button className="bg-transparent hover:bg-green-600/10 hover:border-green-300
             p-4 cursor-pointer" variant="outline" size="lg" onClick={() => void loadAccommodations()}>
              Recargar
              <RefreshCwIcon className="ml-2 size-4" aria-hidden="true" />
            </Button>
            {canCreate && 
              <Button 
              className="p-4 bg-green-600 hover:bg-green-700 cursor-pointer"
              size="lg"
              onClick={() => createFormRef.current?.openCreate()}>
                Nueva Estadística
                <PlusIcon className="ml-2 size-4" aria-hidden="true" />
              </Button>
            }
            
          </div>
        </div>

        
        {selectedAccommodation && 
          <AccommodationStatisticsPage
          ref={createFormRef}
          key={selectedAccommodation.id}
          accommodationId={selectedAccommodation.id}
          hideBackLink
          hideCreateAction
          view={view}
        />}
      </>}
    </div>
  )
}
