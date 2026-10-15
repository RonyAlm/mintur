import type { ReactNode } from "react"

import { Separator } from "@/components/ui/separator"

interface Props {
  /** Título de la sección (h2 dentro de la jerarquía de encabezados). */
  title: string
  /** Descripción corta bajo el título. */
  desc: string
  children: ReactNode
}

/**
 * Sección de contenido al estilo shadcn-admin: título + descripción +
 * separador + formulario acotado a un ancho cómodo de lectura.
 */
export function ContentSection({ title, desc, children }: Props) {
  return (
    <div className="flex flex-col">
      <h2 className="text-lg font-medium text-foreground">{title}</h2>
      <p className="mt-1 max-w-xl text-sm text-muted-foreground">{desc}</p>

      <Separator className="my-4" />

      <div className="w-full max-w-xl">{children}</div>
    </div>
  )
}
