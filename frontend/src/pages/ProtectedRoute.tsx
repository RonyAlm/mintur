import { Navigate, Outlet, useLocation } from "react-router"
import { useAuth } from "../hooks/useAuth"

interface Props {
  redirectTo?: string
}

export const ProtectedRoute = ({ redirectTo = "/auth/login" }: Props) => {
  const { user, loading } = useAuth()
  const location = useLocation()

  // Aún resolviendo la sesión: evita parpadeos y redirecciones erróneas.
  if (loading) {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background"
        role="status"
        aria-label="Cargando sesión"
      >
        <span className="size-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!user) {
    // Conserva la ruta de destino para volver tras iniciar sesión.
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  return <Outlet />
}
