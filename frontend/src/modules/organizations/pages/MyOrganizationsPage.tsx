import { useEffect, useState } from "react"
import { Building2Icon, ChartPieIcon, UsersIcon } from "lucide-react"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
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

function AccommodationDetail({ label, value }: { label: string; value: string | number | null }) {
  return (
    <div>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="text-sm font-medium">{value ?? "No especificado"}</dd>
    </div>
  )
}

const roleLabels = {
  OWNER: "Propietario",
  ADMIN: "Administrador",
  OPERATOR: "Operador",
} as const

export default function MyOrganizationsPage() {
  const { user } = useAuth()
  const [memberships, setMemberships] = useState<OrganizationMembership[]>([])
  const [membersByOrganization, setMembersByOrganization] = useState<OrganizationMembersState>({})
  const [accommodationsByOrganization, setAccommodationsByOrganization] = useState<OrganizationAccommodationState>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const canReadMembers = hasPermission(user, "organization_members:read")

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
          if (!cancelled) {
            setMembersByOrganization(Object.fromEntries(memberResults))
          }
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

  return (
    <main className="mx-auto w-full max-w-7xl space-y-6 p-6">
      <header>
        <h1 className="text-2xl font-semibold">Mis organizaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Consulta las organizaciones a las que perteneces y tu rol en cada una.
        </p>
      </header>

      {loading && <p role="status">Cargando organizaciones…</p>}
      {error && <p role="alert" className="text-destructive">{error}</p>}

      {!loading && !error && memberships.length === 0 && (
        <section className="rounded-lg border p-6 text-sm text-muted-foreground">
          Aún no perteneces a ninguna organización.
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map(({ organizationId, role, organization }) => {
          const canManageMembers = role === "OWNER" || role === "ADMIN"
          const members = membersByOrganization[organizationId]
          const accommodations = accommodationsByOrganization[organizationId]

          return (
            <Card key={organizationId} className="rounded-lg  bg-card">
              <CardHeader className="flex items-center gap-3">
                <Building2Icon className="text-green-600 mt-1 mr-2 size-8" aria-hidden="true" />
                <div className="">
                  <CardTitle className="text-lg text-green-600">{organization?.name ?? organizationId}</CardTitle>
                  <CardDescription className="text-sm font-semibold text-green-600/80">
                   {roleLabels[role] ?? role}
                  </CardDescription>
                  {organization?.description && (
                    <p className="mt-2 text-sm text-muted-foreground">{organization.description}</p>
                  )}
                </div>
              </CardHeader>

              {organization?.type === "ACCOMMODATION" && (
                <CardContent className="border-t p-6">
                  <h3 className="mb-3 text-sm font-medium">Información general del alojamiento</h3>
                  {accommodations === undefined ? (
                    <p className="text-sm text-muted-foreground">Cargando información…</p>
                  ) : accommodations === null ? (
                    <p role="alert" className="text-sm text-destructive">
                      No se pudo cargar la información del alojamiento.
                    </p>
                  ) : (
                    <dl className="grid grid-cols-2 gap-3">
                      <AccommodationDetail label="Tipo" value={accommodationTypeLabels[accommodations.type] ?? accommodations.type} />
                      <AccommodationDetail label="Estado" value={accommodations.isActive ? "Activo" : "Inactivo"} />
                      <AccommodationDetail label="Capacidad" value={accommodations.capacity} />
                      <AccommodationDetail label="Habitaciones" value={accommodations.totalRooms} />
                      <AccommodationDetail label="Camas" value={accommodations.totalBeds} />
                      <AccommodationDetail label="Localidad" value={accommodations.locality} />
                      <AccommodationDetail label="Dirección" value={accommodations.address} />
                      <AccommodationDetail label="Teléfono" value={accommodations.phoneOne} />
                      <AccommodationDetail label="Correo" value={accommodations.email} />
                      <AccommodationDetail label="Sitio web" value={accommodations.website} />
                    </dl>
                  )}
                </CardContent>
              )}

              {canManageMembers && canReadMembers && (
                <div className="border-t p-4">
                  <h3 className="mb-3 flex items-center gap-2 text-sm font-medium">
                    <UsersIcon className="size-4" aria-hidden="true" />
                    Miembros de {organization?.name ?? "la organización"}
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
                    <ul className="space-y-2">
                      {members.map((member) => (
                        <li key={member.user.id} className="flex items-center justify-between gap-3 rounded-md bg-muted/40 p-3">
                          <div className="flex min-w-0 items-center gap-3">
                            <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden="true">
                              {member.user.username.slice(0, 1).toLocaleUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-medium">{member.user.username}</p>
                              <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                            </div>
                          </div>
                          <span className="shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {roleLabels[member.role] ?? member.role}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

            <CardFooter>
                <Button size="lg" variant="outline" className="w-full cursor-pointer">
                  Ver Estadistica
                  <ChartPieIcon className="ml-2 size-4" aria-hidden="true" />
                  </Button>
            </CardFooter>
            </Card>
          )
        })}
      </div>
    </main>
  )
}
