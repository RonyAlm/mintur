import {
  Home,
  Users,
  Settings,
  BarChart3,
  LogOut,
  HotelIcon,
} from "lucide-react";

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
} from "./ui/sidebar";
import { useAuth } from "../hooks/useAuth";
import { Link } from "react-router";

const mainItems = [
  {
    title: "Inicio",
    url: "/",
    icon: Home,
  },
  {
    title: "Usuarios",
    url: "/usuarios",
    icon: Users,
  },
  {
    title: "Alojamientos",
    url: "/alojamientos",
    icon: HotelIcon,
  },
  {
    title: "Reportes",
    url: "/reportes",
    icon: BarChart3,
  },
];

const systemItems = [
  {
    title: "Configuración",
    url: "/configuracion",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { logout, user } = useAuth();

  // const user = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "a@b.com",
  //   role: "admin",
  // };

  return (
    <Sidebar collapsible="icon">

      {/* HEADER */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                A
              </div>

              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold">
                  Mintur Admin
                </span>

                <span className="truncate text-xs">
                  {user?.email}
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT */}
      <SidebarContent>

        {/* PRINCIPAL */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Principal
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton className="hover:bg-green-300/10"
                    render={<Link  to={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* SISTEMA */}
        <SidebarGroup>
          <SidebarGroupLabel>
            Sistema
          </SidebarGroupLabel>

          <SidebarGroupContent>
            <SidebarMenu>
              {systemItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    render={<a href={item.url} />}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

      </SidebarContent>

      {/* FOOTER */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={logout}>
              <LogOut />
              <span>Cerrar sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

    </Sidebar>
  );
}