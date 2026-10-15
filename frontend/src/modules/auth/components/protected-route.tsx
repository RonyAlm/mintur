import { Navigate, Outlet, useLocation } from "react-router";
import { useAuth } from "@/modules/auth/hooks/useAuth";

export const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Esperar a que termine la restauración de sesión.
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <span className="text-sm text-muted-foreground">
          Verificando sesión...
        </span>
      </div>
    );
  }

  // Sin sesión: enviar al login.
  if (!user) {
    return (
      <Navigate
        to="/auth/login"
        replace
        state={{ from: location }}
      />
    );
  }

  return <Outlet />;
};
