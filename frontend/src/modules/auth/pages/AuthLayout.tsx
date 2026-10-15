import { Outlet } from "react-router"
import logoFooter from "@/assets/img/M-Turismo-todos-unidos-gobierno-blanco.png"
import logoFormosa from "@/assets/img/formosa-hermosa-blanco.png"
import { ThemeToggle } from "@/components/ThemeToggle"
import {  useEffect, useState } from "react"

const AuthLayout = () => {
  const [hours, setHours] = useState("")
  
  const today = new Date().toLocaleDateString("es-AR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  useEffect(() => {
    const interval = setInterval(() => {
      setHours(new Date().toLocaleTimeString("es-AR", {
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false
      }))
    }, 1000)
    return () => clearInterval(interval)
  })

  return (
    <div className="relative flex min-h-screen w-full p-4 gap-4
     bg-background" >
      
      {/* Formulario */}
      <main
        id="auth-content"
        className="relative flex flex-1 items-center justify-center overflow-hidden px-4
         border border-green-100 rounded-2xl bg-pattern-color">
    
        {/* Elegir el tema también desde el acceso, sin sesión iniciada */}
        <div className="absolute top-4 right-4 z-10">
          <ThemeToggle />
        </div>

        <div className="relative w-full mx-auto max-w-lg">
          <Outlet />
        </div>
      </main>

      <aside className="relative hidden w-full max-w-[50%] flex-col justify-between overflow-hidden rounded-2xl
       bg-[url('@/assets/img/img-banado.jpg')] bg-cover bg-center bg-no-repeat text-left p-6 text-white lg:flex xl:max-w-2xl">

         <div className="absolute inset-0 bg-green-700/50 dark:bg-green-900/50"></div>

        <div className="relative flex items-center justify-between gap-4">
          
          <div className="animate-rise">
            <p className="text-sm font-medium tracking-[0.2em] text-white/80 uppercase">
              {today}
            </p>
            <p className="text-2xl font-medium tracking-[0.2em] text-white/80 uppercase">
              {hours}
            </p>
          </div>

          <img
            src={logoFormosa}
            alt="Ministerio de Turismo de Formosa"
            className=" h-30 w-auto"
          />
        </div>
        
        <img
          src={logoFooter}
          alt="Ministerio de Turismo de Formosa"
          className="relative h-16 w-auto self-center"
        />
      </aside>
    </div>
  )
}

export default AuthLayout
