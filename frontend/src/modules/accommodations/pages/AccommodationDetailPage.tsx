import { useEffect, useState } from "react"
import { ArrowLeftIcon, Building2Icon, MapPinIcon } from "lucide-react"
import { Link, useParams } from "react-router"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getApiErrorMessage } from "@/lib/api-error"
import { accommodationsApi } from "../api/accommodations.api"
import type { Accommodation } from "../types/accommodation.types"

const typeLabels: Record<string, string> = {
  HOTEL: "Hotel",
  APART_HOTEL: "Apart hotel",
  HOSTEL: "Hostel",
  OTHER: "Otro",
}

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="border-b border-border/70 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">{value || "No especificado"}</p>
    </div>
  )
}

export default function AccommodationDetailPage() {
  const { id = "" } = useParams()
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    // setLoading(true)
    accommodationsApi.getById(id)
      .then((result) => { if (active) setAccommodation(result) })
      .catch((reason) => { if (active) setError(getApiErrorMessage(reason)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6">
      <Link to="/alojamientos" className="inline-flex h-9 items-center rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
        <ArrowLeftIcon className="mr-2 size-4" />Volver a alojamientos
      </Link>
      {loading ? <div className="rounded-xl border bg-card p-10 text-sm text-muted-foreground" role="status">Cargando detalle del alojamiento…</div>
        : error || !accommodation ? (
          <Alert variant="destructive"><AlertTitle>No se pudo cargar el alojamiento</AlertTitle>
            <AlertDescription>{error ?? "No se encontró el alojamiento solicitado."}</AlertDescription>
          </Alert>
        ) : (
          <>
            <section className="relative overflow-hidden rounded-2xl border bg-card p-6 md:p-9">
              {/* <div className="absolute -right-10 -top-16 size-64 rounded-full bg-primary/5" /> */}
              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2Icon className="size-7" /></div>
                  <div><p className="text-sm text-muted-foreground">Alojamiento</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">{accommodation.organization.name}</h1>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPinIcon className="size-4" />{[accommodation.locality, accommodation.address].filter(Boolean).join(" · ") || "Ubicación no especificada"}</p>
                  </div>
                </div>
                <Badge variant={accommodation.isActive ? "secondary" : "outline"} className="w-fit px-3 py-1">{accommodation.isActive ? "Activo" : "Inactivo"}</Badge>
              </div>
            </section>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                <CardTitle>Información del establecimiento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-x-8 sm:grid-cols-2">
                <Detail label="Tipo de alojamiento" value={typeLabels[accommodation.type] ?? accommodation.type} />
                <Detail label="Localidad" value={accommodation.locality} />
                <Detail label="Dirección" value={accommodation.address} />
                <Detail label="Capacidad (plazas)" value={accommodation.capacity} />
                <Detail label="Habitaciones" value={accommodation.totalRooms} />
                <Detail label="Camas" value={accommodation.totalBeds} />
                <div className="sm:col-span-2"><Detail label="Descripción" value={accommodation.organization.description} /></div>
              </CardContent></Card>
              <Card>
                <CardHeader>
                  <CardTitle>Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                 <div className="grid gap-x-8 sm:grid-cols-2">
                  <Detail label="Teléfono principal" value={accommodation.phoneOne} />
                  <Detail label="Teléfono secundario" value={accommodation.phoneTwo} />
                  <Detail label="Correo electrónico" value={accommodation.email} />
                  <Detail label="Sitio web" value={accommodation.website} />
                  <Detail label="Instagram" value={accommodation.instagram} />
                  <Detail label="Facebook" value={accommodation.facebook} />
                  <Detail label="Mapa" value={accommodation.addressMap} />
                 </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
    </main>
  )
}
