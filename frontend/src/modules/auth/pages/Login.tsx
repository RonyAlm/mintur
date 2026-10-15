import { Navigate, useLocation } from "react-router";
import LoginForm from "@/modules/auth/components/LoginForm";
import { useAuth } from "../hooks/useAuth";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

interface LocationState {
  from?: { pathname?: string };
}

const Login = () => {
  const { user } = useAuth();
  const location = useLocation();

  useDocumentTitle("Iniciar sesión");

  if (user) {
    const from = (location.state as LocationState | null)?.from?.pathname;

    const target = user.mustChangePassword
      ? "/perfil/cambiar-password"
      : (from ?? "/");

    return <Navigate to={target} replace />;
  }

  return (
    <section className="w-full max-w-md">
      <LoginForm />
    </section>
  );
};

export default Login;