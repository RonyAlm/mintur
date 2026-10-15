import { Link } from "react-router"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  CircleUserIcon,
  LogOutIcon,
  SettingsIcon,
  BadgeQuestionMarkIcon,
} from "lucide-react"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { getDisplayName, getRoleName, getUserInitials } from "@/lib/user"

export function DropdownMenuUser() {
  const { logout, user } = useAuth()

  const displayName = getDisplayName(user)
  const initials = getUserInitials(user)
  const roleName = getRoleName(user)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={`Menú de usuario: ${displayName}`}
        render={
          <Button variant="ghost" className="size-9 rounded-full p-0">
            <Avatar>
              <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                {initials}
              </AvatarFallback>
            </Avatar>
          </Button>
        }
      />

      <DropdownMenuContent className="w-64" align="end">
        <DropdownMenuGroup className="flex items-center gap-3 px-3 py-3">
          <Avatar size="lg">
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col">
            <DropdownMenuLabel className="truncate px-0 pb-0 font-semibold text-foreground">
              {displayName}
            </DropdownMenuLabel>
            <DropdownMenuLabel className="truncate px-0 pt-0 text-xs text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
            {roleName ? (
              <DropdownMenuLabel className="px-0 pt-1 text-[0.7rem] tracking-wide text-primary uppercase">
                {roleName}
              </DropdownMenuLabel>
            ) : null}
          </div>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          <DropdownMenuItem render={<Link to="/perfil" />}>
            <CircleUserIcon aria-hidden="true" />
            Mi perfil
          </DropdownMenuItem>
          
          <DropdownMenuItem render={<Link to="/perfil" />}>
            <SettingsIcon aria-hidden="true" />
            Configuración
          </DropdownMenuItem>
          
          <DropdownMenuItem>
            <BadgeQuestionMarkIcon aria-hidden="true" />
            Soporte
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {/* Un solo elemento interactivo: el propio item (sin botones anidados) */}
          <DropdownMenuItem variant="destructive" onClick={logout}>
            <LogOutIcon aria-hidden="true" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
