import { Link } from "react-router"
import { ArrowLeftIcon } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"
import logoNegro from "@/assets/img/M-Turismo-negro.png"
import logoBlanco from "@/assets/img/M-Turismo-blanco.png"

const NotFound = () => {
  useDocumentTitle("Página no encontrada")

  return (
    <section className="container mx-auto flex w-full max-w-lg animate-rise flex-col items-center justify-center gap-5 py-20 text-center">
      <img
        src={logoBlanco}
        alt="Minsterio de Turismo"
        className="h-24 w-auto hidden dark:block"
      />

      <img
        src={logoNegro}
        alt="Minsterio de Turismo"
        className="h-24 w-auto dark:hidden"
      />

      <p className="text-xs font-medium tracking-[0.3em] text-primary uppercase">
        Error 404
      </p>

      <h1 className="text-7xl leading-none font-semibold text-primary md:text-8xl">
        404
      </h1>

      <p className="text-lg text-muted-foreground">
        La página que buscás no existe o fue movida.
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

export default NotFound
