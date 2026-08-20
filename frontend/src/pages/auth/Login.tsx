import { Link } from "react-router"
import LoginForm from "../../components/LoginForm"

const Login = () => {
  return (
    <section className="w-sm mx-auto">
      {/* <header className="w-full flex flex-col justify-between items-center">
        <h2 className="text-4xl font-bold text-sky-600 mt-4 mb-8 font-nunito">Plonio.</h2>
        <h2 className="text-lg font-bold text-gray-500 mb-2">Iniciar Sesión</h2>
        <p className="text-sm text-gray-400">Por favor ingresa tus credenciales</p>
      </header> */}
      <LoginForm />
      {/* <footer className="flex gap-2 items-center justify-center mt-2">
        <p className="text-sm text-gray-400">No tienes una cuenta?</p>
        <Link to="/auth/register" className="text-sky-600 underline text-sm cursor-pointer">Crear Cuenta</Link>
      </footer> */}
    </section>
  )
}

export default Login