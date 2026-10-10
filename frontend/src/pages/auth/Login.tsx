import { Navigate, useLocation } from "react-router"
import LoginForm from "../../components/LoginForm"
import { useAuth } from "../../hooks/useAuth"
import { useDocumentTitle } from "../../hooks/useDocumentTitle"

interface LocationState {
  from?: { pathname?: string }
}

const Login = () => {
  const { user } = useAuth()
  const location = useLocation()
  useDocumentTitle("Iniciar sesión")

  // Si ya hay sesión, no mostrar el formulario de login.
  if (user) {
    const from = (location.state as LocationState | null)?.from?.pathname
    // Contraseña temporal: se lleva al cambio (no bloquea, el usuario puede
    // navegar libremente después; el aviso permanece hasta que la cambie).
    const target = user.mustChangePassword === false ? "/perfil/contrasena" : (from ?? "/")
    return <Navigate to={target} replace />
  }

  return (
    <section className="w-full max-w-md">
      <LoginForm />
    </section>
  )
}

export default Login
