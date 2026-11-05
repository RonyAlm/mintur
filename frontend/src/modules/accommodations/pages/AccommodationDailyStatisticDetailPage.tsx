import { useContext, useEffect, useState } from "react"
import { Link, useParams, useSearchParams } from "react-router"
import { ArrowLeftIcon, BriefcaseIcon, CalendarDaysIcon, Globe2Icon, GroupIcon, PencilIcon, Users2Icon } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AuthContext } from "@/modules/auth/context/authContext"
import { hasPermission } from "@/lib/modules"
import AccommodationDailyStatisticForm from "../components/AccommodationDailyStatisticForm"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type { AccommodationAgeRange, AccommodationDailyStatistic, AccommodationTravelPurpose } from "../types/accommodation-statistics.types"

const ageLabels: Record<AccommodationAgeRange, string> = {
  AGE_0_12: "Menores de 13 años", AGE_13_17: "13 a 17 años", AGE_18_30: "18 a 30 años",
  AGE_31_45: "31 a 45 años", AGE_46_60: "46 a 60 años", AGE_61_PLUS: "61 años o más",
}

const purposeLabels: Record<AccommodationTravelPurpose, string> = {
  TOURISM: "Turismo", WORK: "Trabajo", BUSINESS: "Negocios", VISIT_FAMILY: "Visita familiar",
  STUDIES: "Estudios", HEALTH: "Salud", EVENTS: "Eventos", OTHER: "Otro",
}

function formatDate(value: string) {
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", { dateStyle: "long" })
}

export function SummaryCard({ title, value, description, icon }: { title: string; value: string | number; description: string, icon: string }) {

  let IconCard = Users2Icon
  if (icon) {
    if (icon === "users") {
      IconCard = Users2Icon
    } else if (icon === "calendar") {
      IconCard = CalendarDaysIcon
    } else if (icon === "globe") {
      IconCard = Globe2Icon
    } else if (icon === "pencil") {
      IconCard = PencilIcon
    } else if (icon === "group") {
      IconCard = GroupIcon
    }

  }
  return <Card>
    <CardHeader className="flex flex-row gap-4 items-center">
      <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
        <IconCard className="text-green-600 size-4" />
      </div>
      <CardTitle className="text-lg font-medium text-muted-foreground">{title}</CardTitle>
    </CardHeader>
    <CardContent className="px-6">
      <div className="text-4xl font-semibold tracking-tight">{value}</div>
      <p className="mt-1 text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
}

export default function AccommodationDailyStatisticDetailPage() {
  const { recordId = "" } = useParams()
  const [searchParams] = useSearchParams()
  const accommodationId = searchParams.get("accommodationId") ?? ""
  const auth = useContext(AuthContext)
  const canUpdate = hasPermission(auth?.user ?? null, "accommodation-statistics:update")
  const [record, setRecord] = useState<AccommodationDailyStatistic | null>(null)
  const [requestState, setRequestState] = useState<{ recordId: string; status: "loading" | "loaded" | "error" }>(() => ({ recordId, status: "loading" }))
  const [editing, setEditing] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const loading = requestState.recordId !== recordId || requestState.status === "loading"
  const error = requestState.recordId === recordId && requestState.status === "error"
  const ageRanges = record?.ageRanges.filter((row) => row.quantity > 0) ?? []
  const travelPurposes = record?.travelPurposes.filter((row) => row.quantity > 0) ?? []
  const origins = record?.origins.filter((row) => row.quantity > 0) ?? []

  useEffect(() => {
    let active = true
    accommodationStatisticsApi.getDailyStatistic(recordId).then((result) => {
      if (active) {
        setRecord(result)
        setRequestState({ recordId, status: "loaded" })
      }
    }).catch(() => {
      if (active) setRequestState({ recordId, status: "error" })
    })
    return () => { active = false }
  }, [recordId, retryCount])

  const returnPath = `/estadisticas/mis-registros${accommodationId ? `?accommodationId=${encodeURIComponent(accommodationId)}` : ""}`

  return <main className="mx-auto w-full max-w-6xl space-y-6">
    <Link to={returnPath} className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
      <ArrowLeftIcon className="mr-2 size-4" />Volver a Mis Registros
    </Link>

    {loading && <div role="status" aria-label="Cargando detalle del registro" className="space-y-4"><Skeleton className="h-10 w-72" /><Skeleton className="h-48 w-full" /></div>}
    {error && <Alert variant="destructive"><AlertTitle>No se pudo cargar el registro</AlertTitle><AlertDescription className="flex flex-wrap items-center justify-between gap-3">Verifica tu acceso e inténtalo nuevamente.<Button variant="outline" size="sm" onClick={() => { setRequestState({ recordId, status: "loading" }); setRetryCount((count) => count + 1) }}>Reintentar</Button></AlertDescription></Alert>}

    {!loading && !error && record && <>
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="text-sm text-muted-foreground">Mis Registros</p>
          <h1 className="text-3xl font-semibold tracking-tight">Detalle del registro</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Información del {formatDate(record.date)}.
          </p>
        </div>
        {canUpdate && !editing &&
          <Button size="lg"
            className="flex items-center p-4 bg-green-600 hover:bg-green-700 cursor-pointer"
            onClick={() => setEditing(true)}>
            Editar registro
            <PencilIcon className="ml-2 size-4" aria-hidden="true" />
          </Button>}
      </header>

      <div className="space-y-5">
        <section className="grid gap-3 sm:grid-cols-3" aria-label="Resumen del registro">
          <SummaryCard
            title="Total de huéspedes"
            icon="users"
            value={record.totalGuests}
            description="Personas registradas" />
          <SummaryCard
            icon="users"
            title="Rangos de edad"
            value={ageRanges.length}
            description="Categorías con huéspedes" />
          <SummaryCard
            title="Procedencias"
            icon="globe"
            value={origins.length}
            description="Orígenes con huéspedes" />
        </section>
        <section className="grid gap-4 sm:grid-cols-2">
          <Card>
            <CardHeader className="flex flex-row gap-4 items-center">
              <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
                <Users2Icon className="text-green-600 size-4" />
              </div>
              <CardTitle className="text-base">Rangos de edad</CardTitle>
            </CardHeader>
            <CardContent className="px-8 space-y-2">
              {ageRanges.length ? ageRanges.map((row) =>
                <div key={row.ageRange} className="flex justify-between gap-3 text-sm">
                  <span>{ageLabels[row.ageRange]}</span>
                  <span className="font-medium tabular-nums">{row.quantity}</span>
                </div>)
                : <p className="text-sm text-muted-foreground">Sin huéspedes registrados por edad.</p>}
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row gap-4 items-center">
              <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
                <BriefcaseIcon className="text-green-600 size-4" />
              </div>
              <CardTitle className="text-base">Motivo del viaje</CardTitle>
            </CardHeader>
            <CardContent className=" px-8 space-y-2">
              {travelPurposes.length ? travelPurposes.map((row) =>
                <div key={row.purpose} className="flex justify-between gap-3 text-sm">
                  <span>{purposeLabels[row.purpose]}</span>
                  <span className="font-medium tabular-nums">{row.quantity}</span>
                </div>)
                : <p className="text-sm text-muted-foreground">Sin huéspedes registrados por motivo.</p>}
            </CardContent>
          </Card>
        </section>
        <Card>
          <CardHeader className="flex flex-row gap-4 items-center">
            <div className="p-3 rounded-full bg-green-200/20 dark:bg-green-200/10">
               <Globe2Icon className="text-green-600 size-4" />
            </div>
            <CardTitle className="text-base">
              Procedencia de los huéspedes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {origins.length > 0
              ? <Table>
                <TableHeader className="bg-green-100 dark:bg-green-900/30">
                  <TableRow>
                    <TableHead>Procedencia</TableHead>
                    <TableHead>
                      Tipo</TableHead>
                    <TableHead className="text-right">Huéspedes</TableHead>
                  </TableRow>
                </TableHeader><TableBody>{origins.map((origin, index) =>
                  <TableRow key={`${origin.type}-${origin.name}-${index}`}>
                    <TableCell>{origin.name}</TableCell>
                    <TableCell>{origin.type === "PROVINCE" ? "Provincia" : "País"}</TableCell>
                    <TableCell className="text-right tabular-nums">{origin.quantity}</TableCell>
                  </TableRow>)}
                </TableBody>
              </Table> : <p className="py-8 text-center text-sm text-muted-foreground">Sin datos de procedencia para mostrar.</p>}
          </CardContent>
        </Card>
      </div>
      <Dialog open={editing} onOpenChange={setEditing}>
        <DialogContent className="max-h-[90vh] max-w-3xl p-0 pb-4 overflow-auto  scrollbar-thin">
          <DialogHeader className="flex flex-row items-center gap-4 border-b p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full p-4 bg-green-200/20 dark:bg-green-200/10">
              <CalendarDaysIcon className="text-green-500 h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <DialogTitle>Editar registro</DialogTitle>
              <DialogDescription>Actualiza la información estadística del día.</DialogDescription>
            </div>
          </DialogHeader>
          <AccommodationDailyStatisticForm
            key={record.id}
            accommodationId={record.accommodationId}
            initialRecord={record}
            onCancel={() => setEditing(false)}
            onCreated={(updatedRecord) => {
              setRecord(updatedRecord)
              setEditing(false)
              toast.success("Registro actualizado correctamente.")
            }}
          />
        </DialogContent>
      </Dialog>
    </>}
  </main>
}
