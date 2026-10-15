import { Link, Outlet, useLocation } from "react-router"
import { TriangleAlertIcon } from "lucide-react"
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { buttonVariants } from "@/components/ui/button"
import { AppSidebar } from "@/components/AppSidebar"
import { DropdownMenuUser } from "@/components/DropdownMenuUser"
import { ThemeToggle } from "@/components/ThemeToggle"
import { useAuth } from "@/modules/auth/hooks/useAuth"
// import { useDocumentTitle } from "@/hooks/useDocumentTitle"
// import { APP_MODULES } from "@/lib/modules"
import { getDisplayName } from "@/lib/user"
import { cn } from "@/lib/utils"

const ROUTE_TITLES: Record<string, string> = {
  "/": "Inicio",
  "/perfil": "Mi perfil",
  // Ruta anidada de /perfil: el h1 se mantiene como contexto de página.
  "/perfil/cambiar-password": "Mi perfil",
  "/usuarios": "Usuarios",
  "/alojamientos": "Alojamientos",
  "/reportes": "Reportes",
  "/configuracion": "Configuración",
  "/roles": "Roles y permisos",
}

const RootLayout = () => {
  const { user } = useAuth()
  const { pathname } = useLocation()

  // Módulo sin acceso por permisos: el contenido es el 404, así que el
  // header no debe anunciar el nombre del módulo.
  // const blockedModule = APP_MODULES.find(
  //   (module) => module.path === pathname && !hasModuleAccess(user, module.id)
  // )

  const title = ROUTE_TITLES[pathname]

  // Aviso de contraseña temporal: se oculta en la propia sección de cambio,
  // donde el formulario ya muestra el detalle.
  const showPasswordBanner =
    (user?.mustChangePassword ?? false) && pathname !== "/perfil/cambiar-password"

  return (
    <SidebarProvider >
      {/* Skip link: primera parada del tabulador (WCAG 2.4.1) */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-100
         focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:text-primary-foreground focus:shadow-lg"
      >
        Saltar al contenido principal
      </a>

      <AppSidebar />

      <SidebarInset className="bg-pattern-color-2">
        <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center gap-3 border-b border-border/70 bg-background/85 px-4 backdrop-blur-md">
          <SidebarTrigger aria-label="Abrir o cerrar menú lateral" />

          <div className="flex min-w-0 flex-col">
            <h1 className="truncate text-base leading-tight font-semibold">{title}</h1>
          </div>

          <div className="flex-1" />

          <span className="hidden max-w-48 truncate text-sm text-muted-foreground md:inline">
            {getDisplayName(user)}
          </span>

          <ThemeToggle />

          <DropdownMenuUser />
        </header>

        {showPasswordBanner && (
          <div
            role="status"
            className="border-b border-border bg-muted px-4 py-2.5 md:px-6"
          >
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm">
              <TriangleAlertIcon
                className="size-4 shrink-0 text-muted-foreground"
                aria-hidden
              />
              <p className="min-w-0 flex-1 text-foreground">
                Estás usando una{" "}
                <strong className="font-medium">contraseña temporal</strong>.
                Por seguridad, creá una nueva antes de seguir navegando.
              </p>
              <Link
                to="/perfil/cambiar-password"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "shrink-0"
                )}
              >
                Cambiar ahora
              </Link>
            </div>
          </div>
        )}

        <main
          id="main-content"
          tabIndex={-1}
          className="flex flex-1 flex-col gap-6 p-4 outline-none md:p-6"
        >
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}

export default RootLayout
