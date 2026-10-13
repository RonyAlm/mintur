import { NavLink } from "react-router"
import { KeyRoundIcon, UserRoundIcon } from "lucide-react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { to: "/perfil", label: "Cuenta", icon: UserRoundIcon, end: true },
  { to: "/perfil/contrasena", label: "Contraseña", icon: KeyRoundIcon },
]

export function SidebarNav() {
  return (
    <nav
      aria-label="Secciones del perfil"
      className="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0"
    >
      {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) => cn(
            buttonVariants({ variant: "ghost" }),
            "h-10 justify-start gap-2 whitespace-nowrap lg:h-9 lg:w-full",
            isActive && "bg-muted font-medium text-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          <Icon aria-hidden />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
