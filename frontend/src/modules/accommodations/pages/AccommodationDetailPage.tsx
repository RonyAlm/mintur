import { useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon, BedDoubleIcon, BedIcon, Building2Icon, CheckCircle2Icon, Globe2Icon, HotelIcon, InfoIcon, ListTree, MailIcon, MapPinIcon, MessageCircle, PhoneIcon, SquareUser, UserPlusIcon, UserRoundXIcon, UsersIcon } from "lucide-react"
import { Link, useParams } from "react-router"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox"
import { getApiErrorMessage } from "@/lib/api-error"
import { accommodationsApi } from "../api/accommodations.api"
import { organizationsApi, type OrganizationMember, type OrganizationMemberRole } from "@/modules/organizations/api/organizations.api"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { hasPermission } from "@/lib/modules"
import rolesApi, { type ManagedRole } from "@/modules/roles/api/roles.api"
import usersApi, { type ManagedUser } from "@/modules/users/api/users.api"
import { getEligibleMemberUsers } from "@/modules/organizations/utils/eligible-member-users"
import AccommodationWeeklyStatisticsCard from "../components/statistics/AccommodationWeeklyStatisticsCard"
import { accommodationTypes } from "../constants/accommodation-options"
import { AccommodationType, type Accommodation } from "../types/accommodation.types"

function Detail({ label, value, icon, link }:
  { label: string; value?: string | number | null, icon?: React.ReactNode, link?: string | null }) {
  return (
    <div className="border-b border-border/70 py-3 last:border-0">
      <div className="flex items-center gap-2 mb-4">
        {icon && <span className="text-muted-foreground" aria-hidden="true">{icon}</span>}
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      </div>
      {
        link ? (
          <a target="_blank" rel="noopener noreferrer" href={link}
            className="mt-1 wrap-break-word text-sm font-medium hover:underline hover:text-green-600">
            {value === null || value === undefined || value === "" ? "No especificado" : value}
          </a>
        ) : (
          <p className="mt-1 wrap-break-word text-sm font-medium">
            {value === null || value === undefined || value === "" ? "No especificado" : value}
          </p>
        )

      }
    </div>
  )
}

export default function AccommodationDetailPage() {
  const { id = "" } = useParams()
  const { user } = useAuth()
  const [accommodation, setAccommodation] = useState<Accommodation | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [members, setMembers] = useState<OrganizationMember[]>([])
  const [memberRole, setMemberRole] = useState<OrganizationMemberRole>("OPERATOR")
  const [memberError, setMemberError] = useState<string | null>(null)
  const [addMemberDialogOpen, setAddMemberDialogOpen] = useState(false)
  const [candidateUsers, setCandidateUsers] = useState<ManagedUser[]>([])
  const [candidateRoles, setCandidateRoles] = useState<ManagedRole[]>([])
  const [selectedUserId, setSelectedUserId] = useState("")
  const [loadingCandidates, setLoadingCandidates] = useState(false)
  const [savingMember, setSavingMember] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<OrganizationMember | null>(null)
  const [isSystemUser, setIsSystemUser] = useState(false)
  const [canViewOrgMembers, setCanViewOrgMembers] = useState(false)

  useEffect(() => {
    let active = true
    if (!user?.role.id) {
      setIsSystemUser(false)
      return () => { active = false }
    }
    rolesApi.getById(user.role.id)
      .then((role) => { if (active) setIsSystemUser(role.isSystemRole) })
      .catch(() => { if (active) setIsSystemUser(false) })
    return () => { active = false }
  }, [user?.role.id])

  useEffect(() => {
    let active = true
    // setLoading(true)
    accommodationsApi.getById(id)
      .then((result) => { if (active) setAccommodation(result) })
      .catch((reason) => { if (active) setError(getApiErrorMessage(reason)) })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [id])

  useEffect(() => {
    let active = true
    if (!accommodation) return () => { active = false }
    if (isSystemUser) setCanViewOrgMembers(true)
    else {
      organizationsApi.listMine().then((mine) => {
        const membership = mine.find(({ organizationId }) => organizationId === accommodation.organizationId)
        if (active) setCanViewOrgMembers(membership?.role === "OWNER" || membership?.role === "ADMIN")
      }).catch(() => { if (active) setCanViewOrgMembers(false) })
    }
    return () => { active = false }
  }, [accommodation, isSystemUser])

  useEffect(() => {
    if (!accommodation || !canViewOrgMembers || !hasPermission(user, "organization_members:read")) return
    let active = true
    organizationsApi.listMembers(accommodation.organizationId)
      .then((result) => { if (active) setMembers(result) })
      .catch(() => { if (active) setMemberError("No se pudieron cargar los miembros de la organización.") })
    return () => { active = false }
  }, [accommodation, canViewOrgMembers, user])

  const canReadMembers = canViewOrgMembers && hasPermission(user, "organization_members:read")
  const canReadStatistics = hasPermission(user, "accommodation-statistics:read")
  const canManageMembers = isSystemUser && hasPermission(user, "organization_members:create") && hasPermission(user, "organization_members:delete")

  const eligibleUsers = useMemo(
    () => getEligibleMemberUsers(
      candidateUsers,
      candidateRoles,
      new Set(members.map(({ userId }) => userId)),
    ),
    [candidateUsers, candidateRoles, members],
  )
  const userOptions = useMemo(
    () => eligibleUsers.map((candidate) => ({
      value: candidate.id,
      label: `${candidate.username} · ${candidate.email}`,
    })),
    [eligibleUsers],
  )
  const selectedUser = userOptions.find(({ value }) => value === selectedUserId) ?? null

  useEffect(() => {
    if (!addMemberDialogOpen) return
    let active = true
    setLoadingCandidates(true)
    setMemberError(null)
    Promise.all([usersApi.list(), rolesApi.list()])
      .then(([users, roles]) => {
        if (!active) return
        setCandidateUsers(users)
        setCandidateRoles(roles)
      })
      .catch(() => {
        if (active) setMemberError("No se pudo cargar la lista de usuarios disponibles.")
      })
      .finally(() => { if (active) setLoadingCandidates(false) })
    return () => { active = false }
  }, [addMemberDialogOpen])

  async function addMember(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!accommodation || !selectedUserId) return
    setMemberError(null)
    setSavingMember(true)
    try {
      await organizationsApi.addMember(accommodation.organizationId, { userId: selectedUserId, role: memberRole })
      toast.success("El miembro se agregó correctamente.")
      setSelectedUserId("")
      setAddMemberDialogOpen(false)
      try {
        setMembers(await organizationsApi.listMembers(accommodation.organizationId))
      } catch {
        setMemberError("El miembro se agregó, pero no se pudo actualizar la lista.")
      }
    } catch {
      setMemberError("No se pudo agregar el miembro. Verifica tus permisos.")
      toast.error("No se pudo agregar el miembro.")
    }
    finally { setSavingMember(false) }
  }

  async function removeMember(userId: string) {
    if (!accommodation) return
    setMemberError(null)
    try {
      await organizationsApi.removeMember(accommodation.organizationId, userId)
      setMembers((current) => current.filter((member) => member.userId !== userId))
      toast.success("El miembro se removió correctamente.")
    } catch {
      setMemberError("No se pudo remover el miembro.")
      toast.error("No se pudo remover el miembro.")
    }
  }

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
              <div className="flex min-w-0 items-start gap-4">
                {accommodation?.image ? (
                  <img
                    src={accommodation.image}
                    alt=""
                    className="size-20 shrink-0 rounded-xl object-cover sm:size-28"
                  />
                ) : (
                  <div className="flex size-20 shrink-0 items-center justify-center rounded-xl
                   bg-linear-to-br from-green-100 to-green-50 text-green-700 
                   sm:size-28 dark:from-green-950 dark:to-green-900 dark:text-green-300">
                    <Building2Icon className="size-9" aria-hidden="true" />
                  </div>
                )}

                <div className="min-w-0 flex-1 pt-0.5">
                  <div className="flex flex-wrap items-center gap-4 justify-between">
                    <h2 className="text-lg font-semibold tracking-tight sm:text-2xl">
                      {accommodation.organization.name}
                    </h2>
                    <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold
                       ${accommodation.isActive ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                        : "bg-muted text-muted-foreground"}`}>
                      <CheckCircle2Icon className="size-3.5" aria-hidden="true" />
                      {accommodation.isActive ? "Activo" : "Inactivo"}
                    </span>

                  </div>
                  <a
                    target="_blank" rel="noopener noreferrer"
                    href={accommodation?.addressMap ? accommodation.addressMap : ``}
                    className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground hover:text-green-700">
                    <MapPinIcon className="size-4" aria-hidden="true" />
                    <span>
                      {accommodation.type === AccommodationType.HOTEL && "Hotel"}
                    </span>
                    {accommodation?.locality
                      && <>
                        <span aria-hidden="true">·</span>
                        <span>{accommodation.address},</span>
                        <span>{accommodation.locality}
                        </span>
                      </>}
                  </a>
                  {accommodation.organization?.description && (
                    <p className="mt-2 line-clamp-2 max-w-4xl text-sm text-muted-foreground">
                      {accommodation.organization.description}
                    </p>
                  )}
                </div>

              </div>
            </section>
            <section className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
                    <ListTree className="text-green-600 size-4" />
                  </div>
                  <CardTitle>Información del establecimiento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-x-8 sm:grid-cols-2">
                  <Detail label="Tipo de alojamiento"
                    icon={<HotelIcon className="size-4" />}
                    value={accommodationTypes.find(({ value }) => value === accommodation.type)?.label ?? accommodation.type} />
                  <Detail label="Localidad"
                    icon={<MapPinIcon className="size-4" />}
                    value={accommodation.locality} />
                  <Detail label="Dirección"
                    link={accommodation?.addressMap}
                    icon={<MapPinIcon className="size-4" />}
                    value={accommodation.address} />
                  <Detail label="Capacidad (plazas)"
                    icon={<UsersIcon className="size-4" />}
                    value={accommodation.capacity} />
                  <Detail label="Habitaciones"
                    icon={<BedDoubleIcon className="size-4" />}
                    value={accommodation.totalRooms} />
                  <Detail label="Camas"
                    icon={<BedIcon className="size-4" />}
                    value={accommodation.totalBeds} />
                  <div className="sm:col-span-2">
                    <Detail label="Descripción"
                      icon={<InfoIcon className="size-4" />}
                      value={accommodation.organization.description} /></div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                  <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
                    <SquareUser className="text-green-600 size-4" />
                  </div>
                  <CardTitle>Información de Contacto</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-x-8 sm:grid-cols-2">
                    <Detail
                      label="Teléfono principal"
                      value={accommodation.phoneOne}
                      icon={<PhoneIcon className="size-4" />} />
                    <Detail
                      label="Teléfono secundario"
                      value={accommodation.phoneTwo}
                      icon={<PhoneIcon className="size-4" />} />
                    <Detail
                      label="Correo electrónico"
                      value={accommodation.email}
                      link={`mailto:${accommodation.email}`}
                      icon={<MailIcon className="size-4" />} />
                    <Detail
                      label="Sitio web"
                      value={accommodation.website}
                      link={accommodation.website}
                      icon={<Globe2Icon className="size-4" />} />
                    <Detail
                      label="Instagram"
                      value={accommodation.instagram}
                      link={accommodation.instagram}
                      icon={<MessageCircle className="size-4" />} />
                    <Detail
                      label="Facebook"
                      link={accommodation.facebook}
                      value={accommodation.facebook}
                      icon={<MessageCircle className="size-4" />} />
                    <Detail
                      label="Mapa"
                      icon={<MapPinIcon className="size-4" />}
                      link={accommodation.addressMap}
                      value={accommodation.addressMap} />
                  </div>
                </CardContent>
              </Card>
            </section>
            {canReadMembers && canReadStatistics && (
              <section className="grid gap-5 lg:grid-cols-2">
                <Card>
                  <CardHeader className="flex flex-row items-center gap-4">
                    <div className=" bg-green-300/20 dark:bg-green-300/10 p-3 rounded-full">
                      <UsersIcon className="text-green-600 size-4" />
                    </div>
                    <CardTitle>Miembros de la organización</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 px-4">
                    {memberError &&
                      <p role="alert" className="text-sm text-destructive">{memberError}</p>}
                    {members.length === 0 ?
                      <p className="text-sm text-muted-foreground">No hay miembros para mostrar.</p> : (
                        <ul className="space-y-2">
                          {members.map((member) =>
                            <li key={member.userId}
                              className="flex items-center justify-between gap-3 border border-border p-4 rounded-lg">
                              <div className="flex min-w-0 items-center gap-3">
                                <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300" aria-hidden="true">
                                  {member.user.username.slice(0, 1).toLocaleUpperCase()}
                                </span>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-semibold">{member.user.username}</p>
                                  <p className="truncate text-xs text-muted-foreground">{member.user.email}</p>
                                </div>
                              </div>
                              <span className="shrink-0 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold
                               text-blue-700 dark:bg-blue-950/60 dark:text-blue-300">
                                {member.role}
                              </span>
                              {canManageMembers &&
                                <button type="button" className="inline-flex items-center gap-1 text-sm text-destructive cursor-pointer"
                                  onClick={() => setMemberToRemove(member)}
                                  aria-label={`Remover a ${member.user.username}`}
                                  title="Remover miembro">
                                  <UserRoundXIcon className="size-4" />
                                </button>
                              }
                            </li>
                          )}
                        </ul>
                      )}
                    {canManageMembers &&
                      <div className="pt-2 w-full flex justify-end">
                        <Button
                          className=" bg-green-600 text-white hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700 cursor-pointer"
                          size="lg" type="button"
                          onClick={() => { setSelectedUserId(""); setAddMemberDialogOpen(true) }}>
                          Agregar miembro
                          <UserPlusIcon className="size-4" />
                        </Button>
                        <Dialog open={addMemberDialogOpen} onOpenChange={(open) => {
                          if (savingMember) return
                          setAddMemberDialogOpen(open)
                          if (!open) setMemberError(null)
                        }}>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Agregar miembro</DialogTitle>
                              <DialogDescription>Selecciona un usuario que no tenga un rol de sistema para agregarlo a esta organización.</DialogDescription>
                            </DialogHeader>
                            <form onSubmit={(event) => void addMember(event)} className="grid gap-4">
                              {memberError && <p role="alert" className="text-sm text-destructive">{memberError}</p>}
                              <Combobox
                                items={userOptions}
                                value={selectedUser}
                                itemToStringValue={(option) => option.label}
                                onValueChange={(option) => setSelectedUserId(option?.value ?? "")}
                                disabled={loadingCandidates || savingMember}
                              >
                                <ComboboxInput aria-label="Usuario" placeholder={loadingCandidates ? "Cargando usuarios…" : "Buscar usuario…"} className="w-full" />
                                <ComboboxContent>
                                  <ComboboxEmpty>{loadingCandidates ? "Cargando usuarios…" : "No hay usuarios disponibles."}</ComboboxEmpty>
                                  <ComboboxList>
                                    {(option) => <ComboboxItem key={option.value} value={option}>{option.label}</ComboboxItem>}
                                  </ComboboxList>
                                </ComboboxContent>
                              </Combobox>
                              <label className="grid gap-1 text-sm">Rol en la organización
                                <select value={memberRole} onChange={(event) => setMemberRole(event.target.value as OrganizationMemberRole)} className="h-9 rounded-md border bg-background px-3" disabled={savingMember}>
                                  <option value="OPERATOR">Operador</option><option value="ADMIN">Administrador</option><option value="OWNER">Propietario</option>
                                </select>
                              </label>
                              <DialogFooter>
                                <Button type="button" variant="outline" disabled={savingMember} onClick={() => setAddMemberDialogOpen(false)}>Cancelar</Button>
                                <Button type="submit" disabled={!selectedUserId || loadingCandidates || savingMember}>{savingMember ? "Agregando…" : "Agregar miembro"}</Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                        <AlertDialog open={memberToRemove !== null} onOpenChange={(open) => { if (!open) setMemberToRemove(null) }}>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Remover miembro?</AlertDialogTitle>
                              <AlertDialogDescription>
                                ¿Estás seguro de que deseas remover a {memberToRemove?.user.username} de esta organización? Esta acción no se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                disabled={!memberToRemove}
                                onClick={() => {
                                  if (memberToRemove) void removeMember(memberToRemove.userId)
                                  setMemberToRemove(null)
                                }}
                              >
                                Remover
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    }
                  </CardContent>
                </Card>
                <AccommodationWeeklyStatisticsCard
                  accommodationId={id}
                  detailsPath={`/alojamientos/${id}/estadisticas`}
                />
              </section>
            )}
          </>
        )}
    </main>
  )
}
