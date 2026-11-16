import { Link } from "react-router"
import {
  ArrowRightIcon,
  Building2Icon,
  CalendarDaysIcon,
  FileChartPieIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UsersIcon,
  type LucideIcon,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { getDisplayName, getRoleName } from "@/lib/user"
import DashboardHeader from "./DashboardHeader"
import MinistryPeriodFilters from "./MinistryPeriodFilters"
import NotificationsMenu from "./NotificationsMenu"
import StatCard from "./StatCard"
import { useMinistryDashboard } from "../hooks/useMinistryDashboard"

interface ModuleCard {
  title: string
  description: string
  to: string
  icon: LucideIcon
}

interface MinistryDashboardProps {
  isSystemRole: boolean
}

const chartColors = ["#2563EB", "#06B6D4", "#10B981", "#F59E0B", "#F43F5E", "#8B5CF6", "#14B8A6", "#F97316"]

const evolutionConfig = {
  guests: { label: "Visitantes", color: "#15ee39" },
} satisfies ChartConfig

const motivesConfig = {
  quantity: { label: "Visitantes", color: "var(--primary)" },
} satisfies ChartConfig

const originsConfig = {
  quantity: { label: "Visitantes", color: "var(--primary)" },
} satisfies ChartConfig

function formatRecordDate(dateKey: string) {
  return new Date(`${dateKey.slice(0, 10)}T00:00:00`).toLocaleDateString("es-AR", {
    day: "numeric",
    month: "short",
  })
}

export default function MinistryDashboard({ isSystemRole }: MinistryDashboardProps) {
  const { user } = useAuth()
  useDocumentTitle("Inicio")

  const {
    period,
    setPeriod,
    customRange,
    setCustomRange,
    range,
    loading,
    error,
    reload,
    visitantes,
    cargasRegistradas,
    alojamientosActivos,
    loadStatus,
    dailyEvolution,
    motives,
    origins,
    comparison,
    latestRecords,
    alerts,
    modules,
  } = useMinistryDashboard(isSystemRole)

  const loadedPercent =
    loadStatus.total > 0 ? Math.round((loadStatus.loaded / loadStatus.total) * 100) : 0

  const deltaDirection = comparison.delta > 0 ? "up" : comparison.delta < 0 ? "down" : "flat"
  const DeltaIcon = deltaDirection === "up" ? TrendingUpIcon : deltaDirection === "down" ? TrendingDownIcon : null

  const quickActions = [
    { label: "Ver alojamientos", to: "/alojamientos", icon: Building2Icon },
    { label: "Consultar registros diarios", to: "/alojamientos/estadisticas/registros", icon: CalendarDaysIcon },
    { label: "Ver reportes", to: "/alojamientos/estadisticas/reportes", icon: FileChartPieIcon },
    { label: "Administrar organizaciones", to: "/mis-organizaciones", icon: UsersIcon },
  ]

  const moduleCards: ModuleCard[] = modules.map(({ title, description, path, icon }) => ({
    title,
    description,
    to: path,
    icon,
  }))

  return (
    <div className="flex flex-col gap-6">
      <DashboardHeader
        greeting={`Hola, ${getDisplayName(user)}`}
        subtitle={getRoleName(user) || "Administrador del Ministerio"}
        right={
          <div className="flex flex-wrap items-center gap-2">
            <MinistryPeriodFilters
              period={period}
              range={range}
              onPeriodChange={setPeriod}
              onRangeChange={(nextRange) => setCustomRange(nextRange)}
            />
            <NotificationsMenu alerts={alerts} />
          </div>
        }
      />

      {error && (
        <Alert variant="destructive">
          <AlertTitle>No se pudieron cargar los datos</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center justify-between gap-3">
            {error}
            <button type="button" onClick={reload} className="text-sm font-medium underline">
              Reintentar
            </button>
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
          <Skeleton className="h-28" />
        </div>
      ) : (
        <section aria-label="Indicadores principales" className="grid gap-4 sm:grid-cols-3">
          <StatCard
            label="Visitantes"
            value={visitantes.toLocaleString("es-AR")}
            description="Total de visitantes registrados"
            icon="users"
          />
          <StatCard
            label="Alojamientos activos"
            value={alojamientosActivos.toLocaleString("es-AR")}
            description="Establecimientos habilitados"
            icon="building"
          />
          <StatCard
            label="Cargas registradas"
            value={cargasRegistradas.toLocaleString("es-AR")}
            description="Estadísticas diarias cargadas"
            icon="calendar"
          />
        </section>
      )}

      {customRange === null && period === "custom" && (
        <Alert>
          <AlertTitle>Seleccioná un rango de fechas</AlertTitle>
          <AlertDescription>
            Elegí un período personalizado para ver los indicadores.
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Gráficos" className="grid gap-4 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Evolución de visitantes</CardTitle>
            <CardDescription>Visitantes registrados por día en el período.</CardDescription>
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
              <p className="py-12 text-center text-sm text-muted-foreground">Sin registros en el período.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Comparación entre períodos</CardTitle>
            <CardDescription>Visitantes vs. período anterior.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Período actual</p>
              <p className="text-3xl font-semibold tabular-nums">{comparison.current.toLocaleString("es-AR")}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Período anterior</p>
              <p className="text-xl font-medium tabular-nums text-muted-foreground">
                {comparison.previous.toLocaleString("es-AR")}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {DeltaIcon && (
                <DeltaIcon
                  aria-hidden="true"
                  className={`size-4 ${deltaDirection === "up" ? "text-emerald-600" : "text-red-600"}`}
                />
              )}
              <span
                className={`text-sm font-semibold ${
                  deltaDirection === "up"
                    ? "text-emerald-600"
                    : deltaDirection === "down"
                      ? "text-red-600"
                      : "text-muted-foreground"
                }`}
              >
                {comparison.deltaPercent === null
                  ? "Sin período previo"
                  : `${comparison.deltaPercent > 0 ? "+" : ""}${comparison.deltaPercent}% vs. período anterior`}
              </span>
            </div>
          </CardContent>
        </Card>
      </section>

      <section aria-label="Distribuciones" className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Motivos del viaje</CardTitle>
            <CardDescription>Composición de los visitantes.</CardDescription>
          </CardHeader>
          <CardContent>
            {motives.length > 0 ? (
              <>
                <ChartContainer config={motivesConfig} className="h-56 w-full">
                  <PieChart>
                    <Pie data={motives} dataKey="quantity" nameKey="name" innerRadius={48} outerRadius={82} paddingAngle={2}>
                      {motives.map((item, index) => (
                        <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                      ))}
                    </Pie>
                    <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                  </PieChart>
                </ChartContainer>
                <ul className="grid gap-x-4 gap-y-2 sm:grid-cols-2">
                  {motives.map((item, index) => (
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
              <p className="py-12 text-center text-sm text-muted-foreground">Sin datos de motivos.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Procedencia de visitantes</CardTitle>
            <CardDescription>Visitantes por provincia o país.</CardDescription>
          </CardHeader>
          <CardContent>
            {origins.length > 0 ? (
              <ChartContainer config={originsConfig} className="h-72 w-full">
                <BarChart accessibilityLayer layout="vertical" data={origins} margin={{ left: 8, right: 16 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="name" width={140} tickLine={false} axisLine={false} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="quantity" radius={4}>
                    {origins.map((item, index) => (
                      <Cell key={item.name} fill={chartColors[index % chartColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ChartContainer>
            ) : (
              <p className="py-12 text-center text-sm text-muted-foreground">Sin datos de procedencia.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Secciones inferiores" className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Estado de carga</CardTitle>
            <CardDescription>
              Alojamientos que registraron estadísticas y los que están pendientes.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Progress value={loadedPercent}>
              <ProgressLabel>
                {loadStatus.loaded} de {loadStatus.total} alojamientos
              </ProgressLabel>
              <ProgressValue />
            </Progress>
            <div className="flex flex-wrap gap-4 text-sm">
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-emerald-500" aria-hidden="true" />
                <span className="text-muted-foreground">Registraron</span>
                <span className="font-semibold tabular-nums">{loadStatus.loaded}</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-muted-foreground/40" aria-hidden="true" />
                <span className="text-muted-foreground">Pendientes</span>
                <span className="font-semibold tabular-nums">{loadStatus.pending}</span>
              </span>
            </div>

            {alerts.length > 0 && (
              <div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-900/40 dark:bg-amber-950/30">
                <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-amber-800 dark:text-amber-300">
                  <TriangleAlertIcon className="size-4" aria-hidden="true" />
                  Alertas de carga
                </p>
                <ul className="space-y-1">
                  {alerts.slice(0, 4).map((alert) => (
                    <li key={alert.accommodationId} className="text-sm text-amber-900/90 dark:text-amber-200/80">
                      <span className="font-medium">{alert.accommodationName}</span>{" "}
                      — {alert.daysSinceLoad === null ? "sin cargas recientes" : `hace ${alert.daysSinceLoad} días sin cargar`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Últimos registros</CardTitle>
            <CardDescription>Últimas cargas realizadas.</CardDescription>
          </CardHeader>
          <CardContent>
            {latestRecords.length === 0 ? (
              <p className="py-8 text-center text-sm text-muted-foreground">Sin cargas en el período.</p>
            ) : (
              <ul className="divide-y divide-border/70">
                {latestRecords.map((record) => (
                  <li key={record.id} className="flex items-center justify-between gap-3 py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{record.accommodationName}</p>
                      <p className="text-xs text-muted-foreground">{formatRecordDate(record.date)}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold tabular-nums">{record.totalGuests.toLocaleString("es-AR")}</p>
                      <span className="inline-flex rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
                        Cargado
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </section>

      <section aria-label="Acciones rápidas" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {quickActions.map(({ label, to, icon: Icon }) => (
          <Link
            key={label}
            to={to}
            className="flex items-center gap-3 rounded-lg border border-border/70 bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-primary/50 hover:bg-accent"
          >
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <span>{label}</span>
          </Link>
        ))}
      </section>

      {moduleCards.length > 0 && (
        <section aria-labelledby="modulos-title">
          <h3 id="modulos-title" className="mb-3 text-lg font-semibold">Módulos</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map(({ title, description, to, icon: Icon }, index) => (
              <Link
                key={to}
                to={to}
                className="group animate-rise border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring"
                style={{ animationDelay: `${index * 70}ms` }}
              >
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <h4 className="flex items-center gap-1.5 font-semibold">
                  {title}
                  <ArrowRightIcon className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" />
                </h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
