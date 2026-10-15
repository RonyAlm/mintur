import { useEffect, useState } from "react"
import { Link } from "react-router"
import {
  ArrowRightIcon,
  Building2Icon,
  HotelIcon,
  ShieldCheckIcon,
  UsersIcon,
  type LucideIcon,
} from "lucide-react"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from "recharts"

import { useAuth } from "@/modules/auth/hooks/useAuth"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getVisibleModules, hasPermission } from "@/lib/modules"
import { getDisplayName } from "@/lib/user"
import permissionsApi from "@/modules/roles/api/permissions.api"
import rolesApi from "@/modules/roles/api/roles.api"
import usersApi from "@/modules/users/api/users.api"

interface ModuleCard {
  title: string
  description: string
  to: string
  icon: LucideIcon
}

const today = new Intl.DateTimeFormat("es-AR", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(new Date())

const occupancyData = [
  { month: "Ene", alojamientos: 42 },
  { month: "Feb", alojamientos: 56 },
  { month: "Mar", alojamientos: 49 },
  { month: "Abr", alojamientos: 68 },
  { month: "May", alojamientos: 61 },
  { month: "Jun", alojamientos: 78 },
  { month: "Jul", alojamientos: 72 },
]

const categoryData = [
  { category: "Hoteles", total: 38 },
  { category: "Cabañas", total: 27 },
  { category: "Hosterías", total: 19 },
  { category: "Otros", total: 12 },
]

const trendConfig = {
  alojamientos: { label: "Alojamientos activos", color: "var(--color-emerald-500)" },
} satisfies ChartConfig

const categoryConfig = {
  total: { label: "Establecimientos", color: "var(--color-orange-500)" },
} satisfies ChartConfig

const Dashboard = () => {
  const { user } = useAuth()
  useDocumentTitle("Inicio")
  const [counts, setCounts] = useState<{ users?: number; roles?: number; permissions?: number }>({})

  const canReadUsers = hasPermission(user, "users:read")
  const canReadRoles = hasPermission(user, "roles:read")
  const canReadPermissions = hasPermission(user, "permissions:read")

  useEffect(() => {
    let cancelled = false

    const loadCounts = async () => {
      const [usersResult, rolesResult, permissionsResult] = await Promise.allSettled([
        canReadUsers ? usersApi.list() : Promise.resolve(undefined),
        canReadRoles ? rolesApi.list() : Promise.resolve(undefined),
        canReadPermissions ? permissionsApi.list() : Promise.resolve(undefined),
      ])

      if (cancelled) return
      setCounts({
        ...(usersResult.status === "fulfilled" && usersResult.value ? { users: usersResult.value.length } : {}),
        ...(rolesResult.status === "fulfilled" && rolesResult.value ? { roles: rolesResult.value.length } : {}),
        ...(permissionsResult.status === "fulfilled" && permissionsResult.value ? { permissions: permissionsResult.value.length } : {}),
      })
    }

    void loadCounts()
    return () => { cancelled = true }
  }, [canReadPermissions, canReadRoles, canReadUsers])

  const modules: ModuleCard[] = getVisibleModules(user).map(
    ({ title, description, path, icon }) => ({ title, description, to: path, icon })
  )

  const metrics = [
    ...(canReadUsers ? [{ label: "Usuarios", value: counts.users, icon: UsersIcon }] : []),
    ...(canReadRoles ? [{ label: "Roles", value: counts.roles, icon: ShieldCheckIcon }] : []),
    ...(canReadPermissions ? [{ label: "Permisos", value: counts.permissions, icon: ShieldCheckIcon }] : []),
  ]

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-2xl bg-transparent p-6 text-green-950 dark:text-green-50 md:p-8">
        <div className="relative animate-rise">
          <p className="text-xs font-medium tracking-[0.2em] text-green-950/70 uppercase dark:text-green-50">{today}</p>
          <h2 className="mt-2 text-3xl leading-tight font-semibold text-green-700 md:text-4xl">
            Hola, {getDisplayName(user)}
          </h2>
        </div>
      </section>

      {metrics.length > 0 && (
        <section aria-label="Resumen administrativo" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {metrics.map(({ label, value, icon: Icon }) => (
            <Card key={label}>
              <CardContent className="flex items-center justify-between gap-4 pt-5">
                <div>
                  <p className="text-sm text-muted-foreground">Total de {label.toLowerCase()}</p>
                  <p className="mt-1 text-3xl font-semibold tabular-nums">{value ?? "—"}</p>
                </div>
                <span className="flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
              </CardContent>
            </Card>
          ))}
        </section>
      )}

      <section aria-labelledby="estadisticas-title">
        <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h3 id="estadisticas-title" className="text-lg font-semibold">Panorama turístico</h3>
            <p className="text-sm text-muted-foreground">Datos de ejemplo para visualizar los indicadores.</p>
          </div>
          <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">DEMO</span>
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.35fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Alojamientos registrados</CardTitle>
              <CardDescription>Evolución mensual · cifras ilustrativas</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trendConfig} className="h-[260px] w-full">
                <AreaChart accessibilityLayer data={occupancyData} margin={{ left: 4, right: 12, top: 8 }}>
                  <defs>
                    <linearGradient id="fillStays" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-alojamientos)" stopOpacity={0.48} />
                      <stop offset="95%" stopColor="var(--color-alojamientos)" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" />
                  <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Area dataKey="alojamientos" type="monotone" stroke="var(--color-alojamientos)" strokeWidth={3} activeDot={{ r: 6, fill: "var(--color-emerald-500)", stroke: "white", strokeWidth: 2 }} fill="url(#fillStays)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Establecimientos por tipo</CardTitle>
              <CardDescription>Distribución ilustrativa · total de ejemplo: 96</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={categoryConfig} className="h-[260px] w-full">
                <BarChart accessibilityLayer data={categoryData} layout="vertical" margin={{ left: 8, right: 12 }}>
                  <CartesianGrid horizontal={false} />
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="category" tickLine={false} axisLine={false} width={76} />
                  <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
                  <Bar dataKey="total" fill="var(--color-total)" radius={[0, 8, 8, 0]} barSize={24} label={{ position: "right", fill: "var(--foreground)", fontSize: 12 }} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Card size="sm" className="flex-row items-center gap-4 px-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Building2Icon className="size-5" aria-hidden="true" /></span>
            <div><p className="text-sm text-muted-foreground">Organizaciones</p><p className="text-xl font-semibold tabular-nums">24 <span className="text-xs font-normal text-muted-foreground">(demo)</span></p></div>
          </Card>
          <Card size="sm" className="flex-row items-center gap-4 px-4">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><HotelIcon className="size-5" aria-hidden="true" /></span>
            <div><p className="text-sm text-muted-foreground">Alojamientos habilitados</p><p className="text-xl font-semibold tabular-nums">78 <span className="text-xs font-normal text-muted-foreground">(demo)</span></p></div>
          </Card>
        </div>
      </section>

      {modules.length > 0 && (
        <section aria-labelledby="modulos-title">
          <h3 id="modulos-title" className="mb-3 text-lg font-semibold">Módulos</h3>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {modules.map(({ title, description, to, icon: Icon }, index) => (
              <Link key={to} to={to} className="group animate-rise border border-border/70 bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-lg focus-visible:ring-2 focus-visible:ring-ring" style={{ animationDelay: `${index * 70}ms` }}>
                <span className="mb-4 flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground"><Icon className="size-5" aria-hidden="true" /></span>
                <h4 className="flex items-center gap-1.5 font-semibold">{title}<ArrowRightIcon className="size-4 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" aria-hidden="true" /></h4>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

export default Dashboard
