import { useEffect, useMemo, useState } from "react"
import { ArrowLeftIcon, BarChart3Icon, Building2Icon, MapPinIcon, UserPlusIcon, UserRoundXIcon } from "lucide-react"
import { Link, useNavigate, useParams } from "react-router"
import { toast } from "sonner"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
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
import { accommodationTypes } from "../constants/accommodation-options"
import type { Accommodation } from "../types/accommodation.types"

function Detail({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="border-b border-border/70 py-3 last:border-0">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-medium">
        {value === null || value === undefined || value === "" ? "No especificado" : value}
      </p>
    </div>
  )
}

export default function AccommodationDetailPage() {
  const { id = "" } = useParams()
  const navigate = useNavigate()
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
              {/* <div className="absolute -right-10 -top-16 size-64 rounded-full bg-primary/5" /> */}
              <div className="relative flex flex-col justify-between gap-5 sm:flex-row sm:items-start">
                <div className="flex gap-4">
                  <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"><Building2Icon className="size-7" /></div>
                  <div><p className="text-sm text-muted-foreground">Alojamiento</p>
                    <h1 className="mt-1 text-3xl font-semibold tracking-tight">{accommodation.organization.name}</h1>
                    <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground"><MapPinIcon className="size-4" />{[accommodation.locality, accommodation.address].filter(Boolean).join(" · ") || "Ubicación no especificada"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge 
                    variant={accommodation.isActive ? "secondary" : "outline"}
                    className="w-fit px-3 py-1">{accommodation.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  {hasPermission(user, "accommodation-statistics:read") && <Button variant="outline" onClick={() => navigate(`/alojamientos/${id}/estadisticas`)}><BarChart3Icon className="size-4" />Ver estadísticas</Button>}</div>
              </div>
            </section>
            <div className="grid gap-5 lg:grid-cols-2">
              <Card>
                <CardHeader>
                <CardTitle>Información del establecimiento</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-x-8 sm:grid-cols-2">
                <Detail label="Tipo de alojamiento" value={accommodationTypes.find(({ value }) => value === accommodation.type)?.label ?? accommodation.type} />
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
            {canReadMembers && (
              <Card>
                <CardHeader><CardTitle>Miembros de la organización</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {memberError && <p role="alert" className="text-sm text-destructive">{memberError}</p>}
                  {members.length === 0 ? <p className="text-sm text-muted-foreground">No hay miembros para mostrar.</p> : (
                    <ul className="space-y-2">
                      {members.map((member) => <li key={member.userId} className="flex items-center justify-between gap-3 rounded-md border p-3">
                        <div><p className="text-sm font-medium">{member.user.username}</p><p className="text-xs text-muted-foreground">{member.user.email} · {member.role}</p></div>
                        {canManageMembers && <button type="button" className="inline-flex items-center gap-1 text-sm text-destructive" onClick={() => setMemberToRemove(member)} aria-label={`Remover a ${member.user.username}`}><UserRoundXIcon className="size-4" />Remover</button>}
                      </li>)}
                    </ul>
                  )}
                  {canManageMembers && <div className="border-t pt-4">
                    <Button type="button" onClick={() => { setSelectedUserId(""); setAddMemberDialogOpen(true) }}>
                      <UserPlusIcon className="size-4" />Agregar miembro
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
                  </div>}
                </CardContent>
              </Card>
            )}
          </>
        )}
    </main>
  )
}
