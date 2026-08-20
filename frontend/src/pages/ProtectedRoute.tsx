import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/useAuth";

interface Props {
  redirectTo?: string;
}

export const ProtectedRoute = ({ redirectTo = "/auth/login" }: Props) => {
  const { user } = useAuth();
  // const user = {
  //   id: "1",
  //   name: "John Doe",
  //   email: "a@b.com",
  //   role: "admin",
  // }
  console.log("Dentro de ProtectedRoute ", user);

  // if(loading) return null
   
  if (!user) {
    return <Navigate to={redirectTo}/>;
  }
  return <Outlet />;
};
