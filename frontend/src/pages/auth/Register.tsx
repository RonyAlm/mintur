import { Link } from "react-router"
import RegisterForm from "../../components/RegisterForm"

const Register = () => {
  return (
    <section className="w-full min-w-2xs mx-auto my-auto md:w-lg flex flex-col gap-2 shadow shadow-sky-200/60 bg-blue-50 p-6 py-8 rounded-xl bg-linear-to-tr from-sky-50 to-gray-100 mt-10">
      <header className="w-full flex flex-col justify-between items-center">
        <h2 className="text-4xl font-bold text-sky-600 mt-4 mb-8 font-nunito">Plonio.</h2>
        <h2 className="text-lg font-bold text-gray-500 mb-2">Registrate</h2>
        <p className="text-sm text-gray-400">Por favor completa el siguiente formulario</p>
      </header>
      <RegisterForm />
      <footer className="flex gap-2 items-center justify-center mt-2">
        <p className="text-sm text-gray-400">Ya tienes una cuenta?</p>
        <Link to="/auth/login" className="text-sky-600 underline text-sm cursor-pointer">Iniciar Sesión</Link>
      </footer>
    </section>
  )
}

export default Register