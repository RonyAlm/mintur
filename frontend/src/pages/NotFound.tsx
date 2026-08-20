import { Link } from "react-router"

const NotFound = () => {
  return (
    <section className="container w-full min-w-2xs mx-auto mt-10 my-7 md:w-lg flex flex-col justify-center items-center gap-4">
        <header>
            <img src="./../../assets/img/formosa-hermosa-blanco.png" alt="404" />
        </header>
        <h1 className="text-9xl font-bold text-sky-600 mt-4 mb-8 font-nunito">404</h1>
        <p className="text-lg font-bold text-gray-500 mb-2">Página no encontrada</p>
        <Link to="/" className="w-max bg-sky-600 text-center text-white hover:bg-sky-700 active:bg-sky-800 outline-offset-2 outline-sky-600 py-2 px-4 rounded-full">Volver al inicio</Link>
    </section>
  )
}

export default NotFound