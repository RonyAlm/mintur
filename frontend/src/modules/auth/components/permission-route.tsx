import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/modules/auth/hooks/useAuth";

interface Props {
  permission: string;
  redirectTo?: string;
}

export const PermissionRoute = ({
  permission,
  redirectTo = "/403",
}: Props) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!user.permissions.includes(permission)) {
    return <Navigate to={redirectTo} replace />;
  }

  return <Outlet />;
};