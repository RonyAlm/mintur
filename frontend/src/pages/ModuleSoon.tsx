import type { LucideIcon } from "lucide-react"
import { ConstructionIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useDocumentTitle } from "@/hooks/useDocumentTitle"

interface Props {
  title: string
  description?: string
  icon?: LucideIcon
}

/** Página temporal para módulos que aún no están implementados. */
const ModuleSoon = ({ title, description, icon: Icon = ConstructionIcon }: Props) => {
  useDocumentTitle(title)

  return (
    <div className="flex flex-1 items-start justify-center pt-6 md:pt-16">
      <Card className="w-full max-w-lg">
        <CardHeader className="items-center text-center">
          <span className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Icon className="size-6" aria-hidden="true" />
          </span>
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription>
            {description ?? "Este módulo se habilitará en una próxima entrega."}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center text-sm text-muted-foreground">
          Módulo en construcción · Fase 2 del roadmap
        </CardContent>
      </Card>
    </div>
  )
}

export default ModuleSoon
