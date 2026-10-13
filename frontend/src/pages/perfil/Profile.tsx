import { Outlet } from "react-router"
import { useAuth } from "@/hooks/useAuth"
import {
  getDisplayName,
  getRoleDescription,
  getRoleName,
  getUserInitials,
} from "@/lib/user"
import { SidebarNav } from "./SidebarNav"

/**
 * Layout de "/perfil" (inspirado en settings de shadcn-admin):
 * tarjeta resumen con el rol del usuario + nav lateral + `<Outlet />`
 * con la sección activa (Cuenta / Contraseña).
 */
const Profile = () => {
  const { user } = useAuth()

  const displayName = getDisplayName(user)
  const initials = getUserInitials(user)
  const roleName = getRoleName(user)
  const roleDescription = getRoleDescription(user)
  const mustChangePassword = user?.mustChangePassword ?? false

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Resumen de la cuenta + rol (los roles se muestran, no se editan aquí) */}
      <section
        aria-labelledby="profile-summary-name"
        className="relative overflow-hidden rounded-2xl border border-border/70 bg-card"
      >
        <div
          className="pattern-grid absolute inset-0 text-foreground/10"
          aria-hidden
        />
        <div
          className="absolute -top-20 -right-16 size-52 rounded-full bg-muted/70 blur-3xl"
          aria-hidden
        />

        <div className="relative flex flex-col gap-5 p-6 sm:flex-row sm:items-center sm:gap-6">
          <div
            className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary font-display text-2xl font-semibold text-primary-foreground ring-1 ring-primary"
            aria-hidden
          >
            {initials}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h2
                id="profile-summary-name"
                className="truncate font-display text-2xl font-semibold text-foreground"
              >
                {displayName}
              </h2>
              {roleName && (
                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold tracking-wide text-primary uppercase">
                  {roleName}
                </span>
              )}
              {mustChangePassword && (
                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-semibold tracking-wide text-secondary-foreground">
                  Contraseña temporal
                </span>
              )}
            </div>

            <p className="mt-1 truncate text-sm text-muted-foreground">
              {user?.email}
              {user?.username ? ` · @${user.username}` : ""}
            </p>

            {roleDescription && (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {roleDescription}
              </p>
            )}
          </div>
        </div>
      </section>

      <div className="flex flex-1 flex-col gap-6 lg:flex-row lg:gap-10">
        <aside className="lg:sticky lg:top-20 lg:w-56 lg:shrink-0 lg:self-start">
          <SidebarNav />
        </aside>
        <div className="min-w-0 flex-1"><Outlet /></div>
      </div>
    </div>
  )
}

export default Profile
