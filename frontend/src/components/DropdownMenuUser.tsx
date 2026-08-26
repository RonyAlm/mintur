
import { Button } from "./ui/button"
import { Avatar, AvatarBadge, AvatarFallback, AvatarImage } from "./ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu"
import { BadgeQuestionMark, CircleUserIcon, LogOutIcon, SettingsIcon } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

interface User {
  name?: string
  email: string
}

interface Props {
  user: User
}

export function DropdownMenuUser() {
  const { logout, user } = useAuth()
  return (
    <DropdownMenu>
      <DropdownMenuTrigger 
        render={ 
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar>
            <AvatarImage
              src=""
              alt="@shadcn"
              className="grayscale"
            />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button> } />
      <DropdownMenuContent className="w-60" align="start">
        <DropdownMenuGroup className="flex items-center px-4 py-4">
          <Avatar>
            <AvatarImage
              src=""
              alt="@shadcn"
              className="grayscale"
            />
            <AvatarFallback>CN</AvatarFallback>
            <AvatarBadge className="bg-green-600 dark:bg-green-800" />
          </Avatar>
          <div className="flex flex-col ml-2">
            <DropdownMenuLabel className="font-semibold pb-0">
              Ronaldo Almirón
            </DropdownMenuLabel>
            <DropdownMenuLabel className="text-xs pt-0 text-muted-foreground">
              {user?.email}
            </DropdownMenuLabel>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <CircleUserIcon className="mr-2 h-4 w-4" />
            Mi Perfil
          </DropdownMenuItem>
          <DropdownMenuItem>
            <SettingsIcon className="mr-2 h-4 w-4" />
            Configuración
          </DropdownMenuItem>
          <DropdownMenuItem>
            <BadgeQuestionMark className="mr-2 h-4 w-4" />
            Soporte
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>
            <Button 
              onClick={logout}
              variant="destructive" 
              className="w-full flex items-center gap-2 cursor-pointer
              hover:bg-destructive/10 hover:text-destructive">
              <LogOutIcon />
                Cerrar sesión
            </Button>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
