import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { accommodationStatisticsApi } from "../api/accommodation-statistics.api"
import type {
  AccommodationAgeRange,
  AccommodationOriginType,
  AccommodationTravelPurpose,
  AccommodationDailyStatistic,
  CreateAccommodationDailyStatisticRequest,
  UpdateAccommodationDailyStatisticRequest,
} from "../types/accommodation-statistics.types"
import { BriefcaseIcon, Clock, InfoIcon, MapPin, Plus, Trash2, UsersIcon } from "lucide-react"
import { ProvinceAutocomplete } from "./statistics/ProvinceAutocomplete"
import { useProvinceNames } from "../hooks/useProvinceNames"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

const ageOptions: { value: AccommodationAgeRange; label: string }[] = [
  { value: "AGE_0_12", label: "Hasta 12 años" },
  { value: "AGE_13_17", label: "13 a 17 años" },
  { value: "AGE_18_30", label: "18 a 30 años" },
  { value: "AGE_31_45", label: "31 a 45 años" },
  { value: "AGE_46_60", label: "46 a 60 años" },
  { value: "AGE_61_PLUS", label: "61 años o más" },
]

const purposeOptions: { value: AccommodationTravelPurpose; label: string }[] = [
  { value: "TOURISM", label: "Turismo" },
  { value: "WORK", label: "Trabajo" },
  { value: "BUSINESS", label: "Negocios" },
  { value: "VISIT_FAMILY", label: "Visita familiar" },
  { value: "STUDIES", label: "Estudios" },
  { value: "HEALTH", label: "Salud" },
  { value: "EVENTS", label: "Eventos" },
  { value: "OTHER", label: "Otros" },
]

type OriginDraft = { id: number; type: AccommodationOriginType; name: string; quantity: string }

function todayAsDateInput() {
  const today = new Date()
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`
}

function getErrorMessage(error: unknown) {
  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { message?: unknown } } }).response
    const message = response?.data?.message
    if (typeof message === "string") return message
    if (Array.isArray(message)) return message.join(" ")
  }
  return "No se pudo guardar la estadística diaria. Inténtalo nuevamente."
}

function originIdentity(type: AccommodationOriginType, name: string) {
  const normalized = name.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase()
  return `${type}:${normalized}`
}

function GuestSubtotalBadge({ assigned, total, complete }: { assigned: number; total: number; complete: boolean }) {
  if (total <= 0) return null
  return (
    <span className={cn(
      "ml-auto inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium whitespace-nowrap",
      complete
        ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/40 dark:bg-emerald-900/20 dark:text-emerald-200"
        : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200",
    )}>
      <Clock className="size-3.5" />
      {assigned} de {total} huéspedes asignados
    </span>
  )
}

export interface AccommodationDailyStatisticFormProps {
  accommodationId: string
  initialRecord?: AccommodationDailyStatistic
  /** Fecha inicial para una carga nueva (p. ej. al hacer click en un día pendiente). */
  initialDate?: string
  onCreated: (record: AccommodationDailyStatistic) => void
  onCancel: () => void
}

export default function AccommodationDailyStatisticForm({
  accommodationId,
  initialRecord,
  initialDate,
  onCreated,
  onCancel,
}: AccommodationDailyStatisticFormProps) {
  const [date, setDate] = useState(() => initialRecord?.date.slice(0, 10) ?? initialDate ?? todayAsDateInput())
  const [totalGuests, setTotalGuests] = useState(() => String(initialRecord?.totalGuests ?? ""))
  const [ageQuantities, setAgeQuantities] = useState<Record<AccommodationAgeRange, string>>(
    () => Object.fromEntries(ageOptions.map(({ value }) => [
      value,
      String(initialRecord?.ageRanges.find((range) => range.ageRange === value)?.quantity ?? 0),
    ])) as Record<AccommodationAgeRange, string>,
  )
  const [purposeQuantities, setPurposeQuantities] = useState<Record<AccommodationTravelPurpose, string>>(
    () => Object.fromEntries(purposeOptions.map(({ value }) => [
      value,
      String(initialRecord?.travelPurposes.find((purpose) => purpose.purpose === value)?.quantity ?? 0),
    ])) as Record<AccommodationTravelPurpose, string>,
  )
  const [origins, setOrigins] = useState<OriginDraft[]>(() => initialRecord?.origins.length
    ? initialRecord.origins.map((origin, index) => ({ ...origin, id: index + 1, quantity: String(origin.quantity) }))
    : [{ id: 1, type: "PROVINCE", name: "", quantity: "" }])
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const { provinceNames, loading: provincesLoading, error: provincesError } = useProvinceNames()

  const originsSubtotal = origins.reduce((sum, row) => sum + Number(row.quantity || 0), 0)
  const ageSubtotal = ageOptions.reduce((sum, { value }) => sum + Number(ageQuantities[value] || 0), 0)
  const purposeSubtotal = purposeOptions.reduce((sum, { value }) => sum + Number(purposeQuantities[value] || 0), 0)
  const guestsNumber = Number(totalGuests || 0)
  const originsComplete = guestsNumber > 0 && originsSubtotal === guestsNumber
  const ageComplete = guestsNumber > 0 && ageSubtotal === guestsNumber
  const purposeComplete = guestsNumber > 0 && purposeSubtotal === guestsNumber

  function updateOrigin(id: number, patch: Partial<OriginDraft>) {
    setOrigins((rows) => rows.map((item) => (item.id === id ? { ...item, ...patch } : item)))
  }

  function removeOrigin(id: number) {
    setOrigins((rows) => rows.filter((item) => item.id !== id))
  }

  function addOrigin() {
    setOrigins((rows) => [
      ...rows,
      { id: rows.reduce((max, row) => Math.max(max, row.id), 0) + 1, type: "PROVINCE", name: "", quantity: "" },
    ])
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setWarning(null)

    const guestCount = Number(totalGuests)
    const ageRanges = ageOptions
      .map(({ value }) => ({ ageRange: value, quantity: Number(ageQuantities[value] || 0) }))
      .filter(({ quantity }) => quantity > 0)
    const travelPurposes = purposeOptions
      .map(({ value }) => ({ purpose: value, quantity: Number(purposeQuantities[value] || 0) }))
      .filter(({ quantity }) => quantity > 0)
    const submittedOrigins = origins
      .filter((origin) => Number(origin.quantity) > 0)
      .map(({ type, name, quantity }) => ({ type, name: name.trim(), quantity: Number(quantity || 0) }))

    const seenOrigins = new Set<string>()
    for (const { type, name } of submittedOrigins) {
      const identity = originIdentity(type, name)
      if (seenOrigins.has(identity)) {
        setWarning(`No podés repetir la misma procedencia: "${name}" ya está cargada como ${type === "PROVINCE" ? "provincia" : "país"}. Sumá sus huéspedes en una sola fila.`)
        return
      }
      seenOrigins.add(identity)
    }

    const breakdowns = [
      { label: "rangos de edad", total: ageRanges.reduce((sum, row) => sum + row.quantity, 0) },
      { label: "motivos de viaje", total: travelPurposes.reduce((sum, row) => sum + row.quantity, 0) },
      { label: "procedencias", total: submittedOrigins.reduce((sum, row) => sum + row.quantity, 0) },
    ]
    const mismatch = breakdowns.find(({ total }) => total !== guestCount)
    if (mismatch) {
      setError(`La suma de ${mismatch.label} debe coincidir con el total de huéspedes (${guestCount}).`)
      return
    }
    if (submittedOrigins.some(({ name, quantity }) => quantity > 0 && !name)) {
      setError("Indica el nombre de cada procedencia con huéspedes registrados.")
      return
    }

    const payload: UpdateAccommodationDailyStatisticRequest = {
      totalGuests: guestCount,
      ageRanges,
      travelPurposes,
      origins: submittedOrigins,
    }

    setSaving(true)
    try {
      let savedRecord: AccommodationDailyStatistic
      if (initialRecord) {
        savedRecord = await accommodationStatisticsApi.updateDailyStatistic(initialRecord.id, payload)
      } else {
        const createPayload: CreateAccommodationDailyStatisticRequest = {
          ...payload,
          accommodationId,
          date,
        }
        savedRecord = await accommodationStatisticsApi.createDailyStatistic(createPayload)
      }
      onCreated(savedRecord)
    } catch (submitError) {
      setError(getErrorMessage(submitError))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="px-6">
        <form className="space-y-6" onSubmit={(event) => void submit(event)}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-medium">Fecha del registro *
              <Input aria-label="Fecha de la estadística" type="date"
               required value={date} disabled={Boolean(initialRecord)}
                onChange={(event) => setDate(event.target.value)} />
            </label>
            <label className="grid gap-2 text-sm font-medium">Total de huéspedes *
              <Input aria-label="Total de huéspedes" type="number" min="0" step="1"
               required value={totalGuests} onChange={(event) => setTotalGuests(event.target.value)} />
            </label>
          </div>

          <Tabs defaultValue="age" className="w-full">
            <TabsList className="w-full flex py-6 px-2 rounded-sm ">
              <TabsTrigger 
                 className="p-4 rounded-sm cursor-pointer"
                 aria-label="Rangos de edad"
                 value="age">Rangos de edad
              </TabsTrigger>
              <TabsTrigger 
                 className="p-4 rounded-sm cursor-pointer"
                 aria-label="Motivos de viaje" 
                 value="purpose">Motivos de viaje
              </TabsTrigger>
              <TabsTrigger 
                 className="p-4 rounded-sm cursor-pointer"
                 aria-label="Procedencias" 
                 value="origin">Procedencias
              </TabsTrigger>
            </TabsList>
            <TabsContent value="age">
              <Card className="py-4 rounded-2xl">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="p-3 bg-muted rounded-full">
                    <UsersIcon className=" text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-semibold">Rangos de edad</CardTitle>
                    <p className="text-sm text-muted-foreground">Distribución de huéspedes por rango de edad</p>
                  </div>
                  <GuestSubtotalBadge assigned={ageSubtotal} total={guestsNumber} complete={ageComplete} />
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 px-2 pb-4">
                    {ageOptions.map(({ value, label }) => 
                    <label key={value} className="grid gap-1 text-sm">{label}
                    <Input aria-label={label} type="number" min="0" step="1" 
                    value={ageQuantities[value]} onChange={(event) => setAgeQuantities({ ...ageQuantities, [value]: event.target.value })} />
                    </label>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="purpose">
              <Card className="py-4 rounded-2xl">
                <CardHeader className="flex flex-row items-start gap-4">
                  <div className="p-3 bg-muted rounded-full">
                    <BriefcaseIcon className="text-green-600" />
                  </div>
                  <div className="min-w-0">
                    <CardTitle className="font-semibold">Motivos de viaje</CardTitle>
                    <p className="text-sm text-muted-foreground">Cantidad de huéspedes según el motivo.</p>
                  </div>
                  <GuestSubtotalBadge assigned={purposeSubtotal} total={guestsNumber} complete={purposeComplete} />
                </CardHeader>
                <CardContent>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    {purposeOptions.map(({ value, label }) => <label key={value} className="grid gap-1 text-sm">{label}<Input aria-label={`Motivo ${label}`} type="number" min="0" step="1" value={purposeQuantities[value]} onChange={(event) => setPurposeQuantities({ ...purposeQuantities, [value]: event.target.value })} /></label>)}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
           
            <TabsContent value="origin">
                <Card className="py-4 rounded-2xl">
                  <CardHeader className="flex flex-row items-start gap-4">
                    <div className="p-3 bg-muted rounded-full">
                      <MapPin className="text-green-600" />
                    </div>
                    <div className="min-w-0">
                      <CardTitle className="font-semibold">Procedencias</CardTitle>
                      <p className="text-sm text-muted-foreground">Origen de los huéspedes</p>
                    </div>
                    <GuestSubtotalBadge assigned={originsSubtotal} total={guestsNumber} complete={originsComplete} />
                  </CardHeader>
                  <CardContent>
                    <div className="mb-2 hidden grid-cols-[7rem_1fr_6rem_2rem] gap-3 px-1 text-xs font-medium text-muted-foreground sm:grid">
                      <span>Tipo</span>
                      <span>Nombre</span>
                      <span>Huéspedes</span>
                      <span />
                    </div>
                    <div className="grid gap-2">
                      {origins.map((origin, index) => (
                        <div key={origin.id} className="grid items-start gap-3 rounded-xl border bg-muted/40 p-3 sm:grid-cols-[7rem_1fr_6rem_2rem]">
                          <label className="grid gap-1 text-sm">
                            <span className="text-xs font-medium text-muted-foreground sm:hidden">Tipo</span>
                            <Select value={origin.type} onValueChange={(value) => { if (value) updateOrigin(origin.id, { type: value }) }}>
                              <SelectTrigger aria-label={`Tipo de procedencia ${index + 1}`} className="h-8 w-full">
                                <SelectValue>{(value) => (value === "COUNTRY" ? "País" : "Provincia")}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PROVINCE">Provincia</SelectItem>
                                <SelectItem value="COUNTRY">País</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="grid gap-1 text-sm">
                            <span className="text-xs font-medium text-muted-foreground sm:hidden">{origin.type === "PROVINCE" ? "Provincia" : "País"}</span>
                            {origin.type === "PROVINCE" && !provincesError ? (
                              <ProvinceAutocomplete ariaLabel={`Nombre de procedencia ${index + 1}`} value={origin.name} onValueChange={(name) => updateOrigin(origin.id, { name })} options={provinceNames} loading={provincesLoading} placeholder="Buscar provincia…" />
                            ) : (
                              <Input aria-label={`Nombre de procedencia ${index + 1}`} value={origin.name} placeholder={origin.type === "PROVINCE" ? "Buscar provincia…" : "Buscar país…"} onChange={(event) => updateOrigin(origin.id, { name: event.target.value })} />
                            )}
                          </label>
                          <label className="w-full grid gap-1 text-sm">
                            <span className="text-xs font-medium text-muted-foreground sm:hidden">Huéspedes</span>
                            <Input aria-label={`Huéspedes de procedencia ${index + 1}`}
                            type="number" min="0" step="1" 
                            className="tabular-nums" 
                            value={origin.quantity} onChange={(event) => updateOrigin(origin.id, { quantity: event.target.value })} />
                          </label>
                          {origins.length > 1 ? (
                            <Button type="button" variant="ghost" size="icon" aria-label={`Quitar procedencia ${index + 1}`} className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive" onClick={() => removeOrigin(origin.id)}><Trash2 className="size-4" /></Button>
                          ) : null}
                        </div>
                      ))}
                    </div>
                    <Button type="button" variant="outline" className="mt-3 w-full border-dashed" onClick={addOrigin}><Plus className="size-4" />Agregar procedencia</Button>
                  </CardContent>
                </Card>
            </TabsContent>

          </Tabs>

          {warning && (
            <Alert variant="default" className="mt-4 border-amber-500/20 bg-amber-500/5 text-amber-900 dark:text-amber-100 [&_[data-slot=alert-description]]:text-amber-800/80 dark:[&_[data-slot=alert-description]]:text-amber-200/80">
              <InfoIcon />
              <AlertTitle>Revisá las procedencias</AlertTitle>
              <AlertDescription>{warning}</AlertDescription>
            </Alert>
          )}
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <InfoIcon />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
            <div className="flex justify-end gap-2">
              <Button 
                  className="p-4 cursor-pointer"
                  size="lg"
                  type="button" variant="outline"
                  onClick={onCancel}
                  disabled={saving}>Cancelar
              </Button>
              <Button className="cursor-pointer bg-green-600 hover:bg-green-700" size="lg" type="submit"
               disabled={saving}>
                {saving ? "Guardando…" : initialRecord ? "Guardar cambios" : "Guardar estadística"}
              </Button>
            </div>
        </form>
    </div>
  )
}
