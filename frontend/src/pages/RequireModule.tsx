import { lazy, type ReactNode } from "react"

import { useAuth } from "@/hooks/useAuth"
import { hasModuleAccess, type ModuleId } from "@/lib/modules"

// Mismo chunk que usa App: el 404 no se duplica en el bundle.
const NotFound = lazy(() => import("./NotFound"))

interface Props {
  /** Módulo requerido para renderizar el contenido. */
  moduleId: ModuleId
  children: ReactNode
}

/**
 * Guardia de módulo por permisos: si el perfil no incluye acceso al módulo
 * asignado, responde con la misma página 404 que una ruta inexistente
 * (no revela que el módulo existe).
 */
export const RequireModule = ({ moduleId, children }: Props) => {
  const { user } = useAuth()

  if (!hasModuleAccess(user, moduleId)) {
    return <NotFound />
  }

  return <>{children}</>
}
