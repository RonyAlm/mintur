import { Link } from "react-router"
import { ArrowLeftIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import logoColor from "@/assets/img/formosa-hermosa-color.png"

const Forbidden = () => {
  useDocumentTitle("Acceso denegado")

  return (
    <section className="container mx-auto flex w-full max-w-lg animate-rise flex-col items-center gap-5 py-16 text-center">
      <img
        src={logoColor}
        alt="Formosa Hermosa"
        className="h-24 w-auto"
      />

      <p className="text-xs font-medium tracking-[0.3em] text-primary uppercase">
        Error 403
      </p>

      <h1 className="text-7xl leading-none font-semibold text-primary md:text-8xl">
        403
      </h1>

      <p className="text-lg text-muted-foreground">
        No tienes permiso para acceder a esta página.
      </p>

      <Link
        to="/"
        className={cn(buttonVariants({ size: "lg" }), "mt-2 h-11 px-6")}
      >
        <ArrowLeftIcon aria-hidden="true" />
        Volver al inicio
      </Link>
    </section>
  )
}

export default Forbidden
