import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface Props {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/auth/login" }: Props) => {
  const { user, loading } = useAuth();
  
  if(loading) return null
   
  if (!user) {
    return <Navigate to={redirectTo}/>;
  }
  return <Outlet />;
};
