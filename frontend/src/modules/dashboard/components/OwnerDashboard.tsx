import { Link } from "react-router"
import {
  CalendarCheckIcon,
  CalendarPlusIcon,
  FileChartPieIcon,
  UsersIcon,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts"

import { useAuth } from "@/modules/auth/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { hasPermission } from "@/lib/modules"
import { getDisplayName } from "@/lib/user"
import { useStatisticsPermissions } from "@/modules/accommodations/hooks/useStatisticsPermissions"
import DashboardFilters from "./DashboardFilters"
import DashboardHeader from "./DashboardHeader"
import RecentRecords from "./RecentRecords"
import StatCard from "./StatCard"
import WeeklyLoadStatus from "./WeeklyLoadStatus"
import { useOwnerDashboard } from "../hooks/useOwnerDashboard"
import { accommodationDisplayName } from "../utils/dashboard.utils"

const chartColors = ["#2563EB", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#14B8A6", "#F97316"]

const weeklyConfig = {
  guests: { label: "Huéspedes", color: "var(--color-emerald-500)" },
} satisfies ChartConfig

const purposeConfig = {
  quantity: { label: "Huéspedes", color: "var(--primary)" },
} satisfies ChartConfig

const evolutionConfig = {
  guests: { label: "Huéspedes", color: "#15ee39" },
} satisfies ChartConfig

export default function OwnerDashboard() {
  const { user } = useAuth()
  const { canCreate } = useStatisticsPermissions()
  const canManageMembers = hasPermission(user, "organization_members:read")
  useDocumentTitle("Inicio")

  const {
    accommodations,
    selectedAccommodation,
    setSelectedId,
    period,
    changePeriod,
    summary,
    records,
    loading,
    error,
    reload,
    daysWithLoad,
    purposeDistribution,
    dailyEvolution,
    weeklyGuests,
  } = useOwnerDashboard()

  const accommodationId = selectedAccommodation?.id ?? ""
  const recordsPath = `/estadisticas/registros?accommodationId=${encodeURIComponent(accommodationId)}`
  const reportsPath = `/estadisticas/reportes?accommodationId=${encodeURIComponent(accommodationId)}`
  const entryPath = `/estadisticas/carga-diaria?accommodationId=${encodeURIComponent(accommodationId)}`

  const quickActions = [
    ...(canCreate
      ? [{ label: "Nueva carga diaria", to: entryPath, icon: CalendarPlusIcon }]
      : []),
    { label: "Mis registros", to: recordsPath, icon: CalendarCheckIcon },
    { label: "Reportes", to: reportsPath, icon: FileChartPieIcon },
    ...(canManageMembers
      ? [{ label: "Administrar miembros", to: "/mis-organizaciones", icon: UsersIcon }]
      : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        greeting={`Hola, ${getDisplayName(user)}`}
        accommodationName={selectedAccommodation ? accommodationDisplayName(selectedAccommodation) : undefined}
        right={<DashboardFilters period={period} onPeriodChange={changePeriod} />}
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

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        summary && (
          <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-2">
            <StatCard
              label="Visitantes"
              value={summary.totalGuests.toLocaleString("es-AR")}
              description="Total del período seleccionado"
              icon="users"
            />
            <StatCard
              label="Días con carga"
              value={daysWithLoad.toLocaleString("es-AR")}
              description="Cantidad de días registrados"
              icon="calendar"
            />
          </section>
        )
      )}

      {selectedAccommodation && (
        <>
          <section aria-label="Acciones rápidas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {quickActions.map(({ label, to, icon: Icon }) => (
              <Button
                key={label}
                variant="outline"
                size="lg"
                className="h-auto justify-start gap-3 px-4 py-3"
                render={<Link to={to} />}
              >
                <Icon className="size-5 text-primary" aria-hidden="true" />
                <span>{label}</span>
              </Button>
            ))}
          </section>

      <section aria-label="Gráficos" className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Visitantes por semana</CardTitle>
            <CardDescription>Total de huéspedes agrupado por semana.</CardDescription>
          </CardHeader>
          <CardContent>
            {weeklyGuests.length > 0 ? (
              <ChartContainer config={weeklyConfig} className="h-64 w-full">
                <BarChart accessibilityLayer data={weeklyGuests} margin={{ left: 4, right: 12 }}>
                  <CartesianGrid vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="guests" />} />
                  <Bar dataKey="guests" fill="var(--color-guests)" radius={4} />
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Sin registros para mostrar en el período.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribución por motivo del viaje</CardTitle>
            <CardDescription>Composición de los huéspedes del período.</CardDescription>
          </CardHeader>
          <CardContent>
            {purposeDistribution.length > 0 ? (
              <>
                <ChartContainer config={purposeConfig} className="h-56 w-full">
                  <PieChart>
                    <Pie data={purposeDistribution} dataKey="quantity" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
                      {purposeDistribution.map((item, index) => (
                        <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
                <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {purposeDistribution.map((item, index) => (
                    <li key={item.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="flex min-w-0 items-center gap-2">
                        <span aria-hidden="true" className="size-2.5 shrink-0 rounded-sm" style={{ backgroundColor: chartColors[index % chartColors.length] }} />
                        <span className="truncate">{item.name}</span>
                      </span>
                      <span className="font-medium tabular-nums">{item.quantity.toLocaleString("es-AR")}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">
                Sin datos de motivos para mostrar.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Evolución diaria de huéspedes</CardTitle>
          <CardDescription>Huéspedes registrados por día en el período seleccionado.</CardDescription>
        </CardHeader>
        <CardContent>
          {dailyEvolution.length > 0 ? (
            <ChartContainer config={evolutionConfig} className="h-64 w-full">
              <AreaChart accessibilityLayer data={dailyEvolution} margin={{ left: 4, right: 12, top: 8 }}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent nameKey="guests" />} />
                <Area type="monotone" dataKey="guests" stroke="#15ee39" strokeWidth={2} fill="#15ee39" fillOpacity={0.18} activeDot={{ r: 4 }} />
              </AreaChart>
            </ChartContainer>
          ) : (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Sin registros diarios para mostrar en este período.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        {accommodationId && <WeeklyLoadStatus accommodationId={accommodationId} />}
        <RecentRecords records={records} recordsPath={recordsPath} />
      </div>
        </>
      )}
    </div>
  )
}
