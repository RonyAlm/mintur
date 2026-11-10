import { useState } from "react"
import { Link, useLocation } from "react-router"
import { BarChart3Icon, Building2Icon, ChevronDownIcon, HomeIcon, LogOutIcon, ShieldCheckIcon, type LucideIcon, UsersIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { getVisibleModules } from "@/lib/modules"
import { cn } from "@/lib/utils"
import { useMyOrganizationMemberships } from "@/modules/organizations/hooks/useMyOrganizationMemberships"
import estrellita from "@/assets/img/estrellita-blanco.png"

interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export function AppSidebar() {
  const { logout, user } = useAuth()
  const { pathname } = useLocation()
  const [usersOpen, setUsersOpen] = useState(pathname.startsWith("/usuarios") || pathname.startsWith("/roles"))
  const [statisticsOpen, setStatisticsOpen] = useState(pathname.startsWith("/estadisticas") || pathname === "/reportes")
  const memberships = useMyOrganizationMemberships(user?.id)
  const hasOrganizations = memberships.length > 0

  // Módulos permitidos por los permisos efectivos del perfil.
  const visibleModules = getVisibleModules(user, hasOrganizations)
  const canSeeUsers = visibleModules.some((module) => module.id === "usuarios")
  const canSeeRoles = visibleModules.some((module) => module.id === "roles")
  const canSeeStatistics = visibleModules.some((module) => module.id === "reportes")

  const mainItems: NavItem[] = [
    { title: "Inicio", url: "/", icon: HomeIcon },
    ...(hasOrganizations ? [
      { title: "Mis organizaciones", url: "/mis-organizaciones", icon: Building2Icon }
    ] : []),
    ...visibleModules
      .filter((module) => module.group === "principal" && module.id !== "usuarios" && module.id !== "reportes")
      .map((module) => ({
        title: module.title,
        url: module.path,
        icon: module.icon,
      })),
  ]

  const renderItems = (items: NavItem[]) =>
    items.map((item) => {
      const isActive =
        item.url === "/" ? pathname === "/" : pathname.startsWith(item.url)

      return (
        <SidebarMenuItem className="mb-2 rounded-lg hover:bg-green-500" key={item.url}>
          <SidebarMenuButton
            isActive={isActive}
            tooltip={item.title}
            aria-current={isActive ? "page" : undefined}
            className={cn(isActive && "font-medium")}
            render={<Link to={item.url} />}
          >
            <item.icon aria-hidden="true" />
            <span>{item.title}</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      )
    })

  return (
    <Sidebar collapsible="icon" variant="floating">
      {/* HEADER */}
      <SidebarHeader className="rounded-2xl">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" render={<Link to="/" />}>
              <div className="flex aspect-square size-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-sidebar-accent">
                <img
                  src={estrellita}
                  alt=""
                  aria-hidden="true"
                  className="size-5 object-contain invert dark:invert-0"
                />
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">Mintur</span>
                <span className="truncate text-xs opacity-70">
                  Plataforma turística
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent className="">
            <SidebarMenu className="">{renderItems(mainItems)}</SidebarMenu>
            {canSeeStatistics && <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  isActive={pathname.startsWith("/estadisticas") || pathname === "/reportes"}
                  tooltip="Estadísticas"
                  aria-expanded={statisticsOpen}
                  onClick={() => setStatisticsOpen((open) => !open)}
                >
                  <BarChart3Icon aria-hidden="true" />
                  <span>Estadísticas</span>
                  <ChevronDownIcon className={cn("ml-auto transition-transform", statisticsOpen && "rotate-180")} aria-hidden="true" />
                </SidebarMenuButton>
                {statisticsOpen && <SidebarMenuSub>
                  <SidebarMenuSubItem><SidebarMenuSubButton isActive={pathname === "/estadisticas/carga-diaria"} render={<Link to="/estadisticas/carga-diaria" />}><span>Carga diaria</span></SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton isActive={pathname.startsWith("/estadisticas/registros") || pathname.startsWith("/estadisticas/mis-registros")} render={<Link to="/estadisticas/registros" />}><span>Registros</span></SidebarMenuSubButton></SidebarMenuSubItem>
                  <SidebarMenuSubItem><SidebarMenuSubButton isActive={pathname === "/estadisticas/reportes" || pathname === "/reportes"} render={<Link to="/estadisticas/reportes" />}><span>Reportes</span></SidebarMenuSubButton></SidebarMenuSubItem>
                </SidebarMenuSub>}
              </SidebarMenuItem>
            </SidebarMenu>}
            {(canSeeUsers || canSeeRoles) && (
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    // isActive={pathname.startsWith("/usuarios") || pathname.startsWith("/roles")}
                    tooltip="Usuarios"
                    aria-expanded={usersOpen}
                    onClick={() => setUsersOpen((open) => !open)}
                  >
                    <UsersIcon aria-hidden="true" />
                    <span>Sistema</span>
                    <ChevronDownIcon className={cn("ml-auto transition-transform", usersOpen && "rotate-180")} aria-hidden="true" />
                  </SidebarMenuButton>
                  {usersOpen && (
                    <SidebarMenuSub >
                      {canSeeUsers &&
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton
                           isActive={pathname.startsWith("/usuarios")} render={<Link to="/usuarios" />}>
                          <UsersIcon className="" aria-hidden="true" /><span>Usuarios</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>}
                      {canSeeRoles &&
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton isActive={pathname.startsWith("/roles")} render={<Link to="/roles" />}>
                          <ShieldCheckIcon className="" aria-hidden="true" /><span>Roles y permisos</span>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>}
                    </SidebarMenuSub>
                  )}
                </SidebarMenuItem>
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Grupo solo si existen módulos de sistema autorizados */}
        {/* {systemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Sistema</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{renderItems(systemItems)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
        <SidebarGroup>
          <SidebarGroupLabel>Configuración</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip="Configuración"
                  aria-expanded={settingsOpen}
                  onClick={() => setSettingsOpen((open) => !open)}
                >
                  <Settings2Icon aria-hidden="true" />
                  <span>Configuración</span>
                  <ChevronDownIcon className={cn("ml-auto transition-transform", settingsOpen && "rotate-180")} aria-hidden="true" />
                </SidebarMenuButton>
                {settingsOpen && (
                  <SidebarMenuSub className="border-l border-l-gray-300">
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive={pathname === "/perfil"} render={<Link to="/perfil" />}>
                        <UserRoundIcon aria-hidden="true" /><span>Perfil</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                    <SidebarMenuSubItem>
                      <SidebarMenuSubButton isActive={pathname.startsWith("/perfil/contrasena")} render={<Link to="/perfil/contrasena" />}>
                        <KeyRoundIcon aria-hidden="true" /><span>Cuenta</span>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  </SidebarMenuSub>
                )}
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup> */}
      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter className="rounded-2xl">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={logout}
              tooltip="Cerrar sesión"
              className=" cursor-pointer"
            >
              <LogOutIcon aria-hidden="true" />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
