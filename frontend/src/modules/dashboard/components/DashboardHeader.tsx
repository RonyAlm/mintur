import type { ReactNode } from "react"

interface DashboardHeaderProps {
  /** Saludo personalizado, ej. "Hola, María". */
  greeting: string
  /** Nombre del alojamiento (vista de establecimiento). */
  accommodationName?: string
  /** Subtítulo auxiliar (rol o descripción). */
  subtitle?: string
  /** Controles a la derecha (selector de período o fecha actual). */
  right?: ReactNode
}

export default function DashboardHeader({
  greeting,
  accommodationName,
  subtitle,
  right,
}: DashboardHeaderProps) {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-transparent p-6 text-green-950 dark:text-green-50 md:py-8 md:px-2">
      <div className="relative animate-rise">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div className="min-w-0">
            <h2 className="text-3xl leading-tight font-semibold text-green-700 md:text-4xl">
              {greeting}
            </h2>
            {accommodationName && (
              <p className="mt-2 truncate text-sm font-medium text-green-950/70 uppercase tracking-wide dark:text-green-50/70">
                {accommodationName}
              </p>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {right && <div className="shrink-0">{right}</div>}
        </div>
      </div>
    </section>
  )
}
