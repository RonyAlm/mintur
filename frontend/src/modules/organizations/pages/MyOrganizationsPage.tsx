import { useEffect, useState } from "react"
import {
  ArrowRightIcon,
  BedDoubleIcon,
  Building2Icon,
  ChartNoAxesColumnIncreasingIcon,
  CheckCircle2Icon,
  GlobeIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
  UsersIcon,
} from "lucide-react"
import { Link } from "react-router"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { Card } from "@/components/ui/card"
import { hasPermission } from "@/lib/modules"
import { accommodationsApi } from "@/modules/accommodations/api/accommodations.api"
import type { Accommodation } from "@/modules/accommodations/types/accommodation.types"
import {
  organizationsApi,
  type OrganizationMember,
  type OrganizationMembership,
} from "../api/organizations.api"

type OrganizationMembersState = Record<string, OrganizationMember[] | null>
type OrganizationAccommodationState = Record<string, Accommodation | null>

const accommodationTypeLabels: Record<string, string> = {
  HOTEL: "Hotel",
  APART_HOTEL: "Apart hotel",
  HOSTEL: "Hostel",
  OTHER: "Otro",
}

const roleLabels = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
} as const

function AccommodationDetail({
  icon,
  label,
  value,
  link,
  isLink,
}: {
  icon: React.ReactNode
  label: string
  value: string | number | null
  link?: string
  isLink?: boolean
}) {

  if (isLink && link) {
    return (
      <div className="flex min-w-0 items-start gap-3 border-b border-border/60 py-2.5 last:border-b-0">
        <span className="mt-0.5 text-muted-foreground" aria-hidden="true">{icon}</span>
        <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
          <dt className="text-sm text-muted-foreground">{label}</dt>
          <dd className="truncate text-sm font-semibold text-foreground">
            <a className="hover:underline hover:text-green-600" target="_blank" rel="noopener noreferrer" href={link}>{value ?? "No especificado"}</a>
          </dd>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-w-0 items-start gap-3 border-b border-border/60 py-2.5 last:border-b-0">
      <span className="mt-0.5 text-muted-foreground" aria-hidden="true">{icon}</span>
      <div className="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between sm:gap-3">
        <dt className="text-sm text-muted-foreground">{label}</dt>
        <dd className="truncate text-sm font-semibold text-foreground">{value ?? "No especificado"}</dd>
      </div>
    </div>
  )
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number | string
}) {
  return (
    <article
      aria-label={`${value} ${label}`}
      className="flex min-w-0 items-center gap-4 rounded-2xl border bg-card/90 p-4 md:p-5"
    >
      <span className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-2xl font-semibold leading-none tracking-tight">{value}</p>
        <p className="mt-1 truncate text-sm text-muted-foreground">{label}</p>
      </div>
    </article>
  )
}

function OrganizationMembersPanel({
  members,
  organizationName,
}: {
  members: OrganizationMember[] | null | undefined
  organizationName: string
}) {
  return (
    <section aria-label={`Miembros de ${organizationName}`}
      className="rounded-xl border p-4">
      <h3 className="mb-3 flex items-center gap-2 font-semibold">
        <UsersIcon className="size-4" aria-hidden="true" />
        Miembros ({members?.length ?? 0})
      </h3>
      {members === undefined ? (
        <p className="text-sm text-muted-foreground">Cargando miembros…</p>
      ) : members === null ? (
        <p role="alert" className="text-sm text-destructive">
          No se pudieron cargar los miembros de esta organización.
        </p>
      ) : members.length === 0 ? (
        <p className="text-sm text-muted-foreground">No hay miembros para mostrar.</p>
      ) : (
        <ul className="divide-y divide-border/70">
          {members.map((member) => (
            <li key={member.user.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" aria-hidden="true">
                  {member.user.username.slice(0, 1).toLocaleUpperCase()}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{member.user.username}</p>
                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                {roleLabels[member.role] ?? member.role}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

type MemberRoleCounts = {
  members: number
  administrators: number
  operators: number
}

/**
 * Counts people per role across the user's organizations.
 *
 * The role of the current user's membership is not the organization's member
 * count: an ADMIN organization can still have operators. Member lists are used
 * when they were loaded, and the current user's own membership is added when
 * their list is unavailable (for example, when they are only an OPERATOR).
 */
function countMemberRoles(
  memberships: OrganizationMembership[],
  membersByOrganization: OrganizationMembersState,
): MemberRoleCounts {
  return memberships.reduce<MemberRoleCounts>(
    (counts, membership) => {
      const members = membersByOrganization[membership.organizationId]
      const memberRoles = members?.map((member) => member.role) ?? []
      const includesCurrentUser = members?.some((member) => member.user.id === membership.userId) ?? false
      const roles = includesCurrentUser ? memberRoles : [...memberRoles, membership.role]

      counts.members += roles.length
      for (const role of roles) {
        if (role === "OPERATOR") counts.operators += 1
        else counts.administrators += 1
      }

      return counts
    },
    { members: 0, administrators: 0, operators: 0 },
  )
}

export default function MyOrganizationsPage() {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [membersByOrganization, setMembersByOrganization] = useState<OrganizationMembersState>({})
  const [accommodationsByOrganization, setAccommodationsByOrganization] = useState<OrganizationAccommodationState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canReadMembers = hasPermission(user, "organization_members:read")
  const canReadStatistics = hasPermission(user, "accommodation-statistics:read")

  useEffect(() => {
    let cancelled = false

    async function loadOrganizations() {
      setLoading(true)
      setError(null)
      setMemberships([])
      setMembersByOrganization({})
      setAccommodationsByOrganization({})
      try {
        const result = await organizationsApi.listMine()
        if (cancelled) return
        setMemberships(result)

        const accommodationOrganizations = result.filter(
          ({ organization }) => organization?.type === "ACCOMMODATION",
        )
        const accommodationResults = await Promise.all(
          accommodationOrganizations.map(async ({ organizationId }) => {
            try {
              return [organizationId, await accommodationsApi.getByOrganization(organizationId)] as const
            } catch {
              return [organizationId, null] as const
            }
          }),
        )
        if (!cancelled) setAccommodationsByOrganization(Object.fromEntries(accommodationResults))

        const manageable = result.filter(
          ({ role }) => role === "OWNER" || role === "ADMIN",
        )
        if (canReadMembers && manageable.length > 0) {
          const memberResults = await Promise.all(
            manageable.map(async ({ organizationId }) => {
              try {
                return [organizationId, await organizationsApi.listMembers(organizationId)] as const
              } catch {
                return [organizationId, null] as const
              }
            }),
          )
          if (!cancelled) setMembersByOrganization(Object.fromEntries(memberResults))
        }
      } catch {
        if (!cancelled) setError("No se pudieron cargar tus organizaciones. Inténtalo nuevamente.")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadOrganizations()
    return () => { cancelled = true }
  }, [canReadMembers])

  const memberRoleCounts = countMemberRoles(memberships, membersByOrganization)
  const statistics = [
    { label: "Organizaciones",
       value: memberships.length, icon:
    <Building2Icon className="size-6" aria-hidden="true" /> },
    { label: "Miembros",
       value: memberRoleCounts.members, icon:
    <UsersIcon className="size-6" aria-hidden="true" /> },
    { label: "Administrador",
       value: memberRoleCounts.administrators, icon:
    <UsersIcon className="size-6" aria-hidden="true" /> },
    { label: "Operador",
       value: memberRoleCounts.operators, icon:
    <UsersIcon className="size-6" aria-hidden="true" /> },
  ]

  return (
    <main className="mx-auto min-h-full w-full max-w-[1440px] space-y-6  px-4 py-6 md:px-7 md:py-8 ">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mis organizaciones</h1>
        <p className="text-sm text-muted-foreground md:text-base">
          Gestioná las organizaciones a las que pertenecés y accedé a sus estadísticas.
        </p>
      </header>

      {!loading && !error && memberships.length > 0 && (
        <section aria-label="Resumen de organizaciones"
          className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {statistics.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </section>
      )}

      {loading && <p role="status" className="py-8 text-sm text-muted-foreground">Cargando organizaciones…</p>}
      {error && <p role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">{error}</p>}

      {!loading && !error && memberships.length === 0 && (
        <section className="rounded-2xl border border-dashed bg-card/70 p-8 text-center">
          <Building2Icon className="mx-auto size-10 text-muted-foreground" aria-hidden="true" />
          <h2 className="mt-3 font-semibold">Todavía no pertenecés a una organización</h2>
          <p className="mt-1 text-sm text-muted-foreground">Cuando te sumes a una, aparecerá en este espacio.</p>
        </section>
      )}

      <div className="space-y-5">
        {memberships.map(({ organizationId, role, organization }) => {
          const canManageMembers = role === "OWNER" || role === "ADMIN"
          const members = membersByOrganization[organizationId]
          const accommodation = accommodationsByOrganization[organizationId]
          const isAccommodation = organization?.type === "ACCOMMODATION"

          return (
            <Card key={organizationId} className="overflow-hidden rounded-2xl border-border/80 bg-card/95">
              <div className="flex flex-col gap-5 p-4 md:p-6">
                <div className="flex min-w-0 items-start gap-4">
                  {accommodation?.image ? (
                    <img
                      src={accommodation.image}
                      alt=""
                      className="size-20 shrink-0 rounded-xl object-cover sm:size-28"
                    />
                  ) : (
                    <div className="flex size-20 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 text-emerald-700 sm:size-28 dark:from-emerald-950 dark:to-emerald-900 dark:text-emerald-300">
                      <Building2Icon className="size-9" aria-hidden="true" />
                    </div>
                  )}

                  <div className="min-w-0 flex-1 pt-0.5">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-lg font-semibold tracking-tight sm:text-2xl">
                        {organization?.name ?? organizationId}
                      </h2>
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${organization?.isActive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                        <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
                        {organization?.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                        Tu rol: {roleLabels[role] ?? role}
                      </span>
                    </div>
                    <a
                      target="_blank" rel="noopener noreferrer"
                      href={accommodation?.addressMap ? accommodation.addressMap : ``}
                      className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground hover:text-green-700">
                      <MapPinIcon className="size-4" aria-hidden="true" />
                      <span>
                        {isAccommodation
                          ? accommodationTypeLabels[accommodation?.type ?? ""]
                          ?? "Alojamiento" : "Organización"}
                      </span>
                      {accommodation?.locality
                        && <>
                          <span aria-hidden="true">·</span>
                          <span>{accommodation.address},</span>
                          <span>{accommodation.locality}
                          </span>
                        </>}
                    </a>
                    {organization?.description && (
                      <p className="mt-2 line-clamp-2 max-w-4xl text-sm text-muted-foreground">
                        {organization.description}
                      </p>
                    )}
                  </div>
                </div>

                {isAccommodation && (
                  <div className="grid gap-4 border-t border-border/70 pt-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(360px,0.9fr)]">
                    <section aria-labelledby={`accommodation-${organizationId}`} className="rounded-xl border border-border/70 p-4">
                      <h3 id={`accommodation-${organizationId}`} className="mb-2 flex items-center gap-2 font-semibold">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                          <Building2Icon className="size-4" aria-hidden="true" />
                        </span>
                        Información general
                      </h3>
                      {accommodation === undefined ? (
                        <p className="py-3 text-sm text-muted-foreground">Cargando información…</p>
                      ) : accommodation === null ? (
                        <p role="alert" className="py-3 text-sm text-destructive">
                          No se pudo cargar la información del alojamiento.
                        </p>
                      ) : (
                        <dl className="grid gap-x-6 sm:grid-cols-2">
                          <AccommodationDetail
                            icon={
                              <Building2Icon className="size-4" />}
                            label="Tipo" value={accommodationTypeLabels[accommodation.type] ?? accommodation.type} />
                          <AccommodationDetail
                            icon={
                              <CheckCircle2Icon className="size-4" />}
                            label="Estado" value={accommodation.isActive ? "Activo" : "Inactivo"} />
                          <AccommodationDetail
                            icon={
                              <UsersIcon className="size-4" />}
                            label="Capacidad" value={accommodation.capacity} />
                          <AccommodationDetail
                            icon={
                              <BedDoubleIcon className="size-4" />}
                            label="Habitaciones" value={accommodation.totalRooms} />
                          <AccommodationDetail
                            icon={
                              <BedDoubleIcon className="size-4" />}
                            label="Camas" value={accommodation.totalBeds} />
                          <AccommodationDetail
                            icon={<MapPinIcon className="size-4" />}
                            label="Localidad"
                            value={accommodation.locality}
                          />
                          <AccommodationDetail
                            link={accommodation?.addressMap ? accommodation.addressMap : ``}
                            isLink={true}
                            icon={
                              <MapPinIcon className="size-4" />}
                            label="Dirección" value={accommodation.address}
                          />
                          <AccommodationDetail
                            icon={<PhoneIcon className="size-4" />}
                            label="Teléfono"
                            value={accommodation.phoneOne}
                            link={'tel:'+ accommodation.phoneOne}
                            isLink={ accommodation.phoneOne ? true : false}  />
                          <AccommodationDetail
                            icon={<MailIcon className="size-4" />}
                            label="Correo"
                            value={accommodation.email}
                            link={ 'mailto:'+ accommodation.email}
                            isLink={ accommodation.email ? true : false} />
                          <AccommodationDetail
                            icon={<GlobeIcon className="size-4" />}
                            label="Web"
                            value={accommodation.website}
                            link={ accommodation?.website ? accommodation.website : ``}
                            isLink={ accommodation.website ? true : false}
                             />
                        </dl>
                      )}
                    </section>

                    <div className="space-y-4">
                      {canReadStatistics && accommodation && (
                        <section className="flex flex-col gap-4 rounded-xl border border-border/70 bg-gradient-to-r from-emerald-50/80 to-card p-4 sm:flex-row sm:items-center sm:justify-between dark:from-emerald-950/40">
                          <div className="flex items-center gap-3">
                            <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300">
                              <ChartNoAxesColumnIncreasingIcon className="size-5" aria-hidden="true" />
                            </span>
                            <div>
                              <h3 className="font-semibold">Estadísticas del alojamiento</h3>
                              <p className="text-xs text-muted-foreground">Registrá cargas, consultá registros y generá reportes.</p>
                            </div>
                          </div>
                          <Link
                            to={`/estadisticas/reportes?accommodationId=${accommodation.id}`}
                            aria-label={`Ver estadísticas de ${organization?.name ?? organizationId}`}
                            className="inline-flex min-h-10 shrink-0 items-center justify-center gap-2
                             rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 focus-visible:ring-offset-2"
                          >
                            Ver estadísticas <ArrowRightIcon className="size-4" aria-hidden="true" />
                          </Link>
                        </section>
                      )}

                      {canManageMembers && canReadMembers && (
                        <OrganizationMembersPanel
                          members={members}
                          organizationName={organization?.name ?? "la organización"}
                        />
                      )}
                    </div>
                  </div>
                )}

                {!isAccommodation && canManageMembers && canReadMembers && (
                  <div className="border-t border-border/70 pt-4">
                    <OrganizationMembersPanel
                      members={members}
                      organizationName={organization?.name ?? "la organización"}
                    />
                  </div>
                )}
              </div>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
