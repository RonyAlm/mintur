import { RefreshCwIcon, UserPlus2Icon } from "lucide-react"
import { Button } from "@/components/ui/button"

type UsersToolbarProps = {
  loading: boolean
  working: boolean
  canCreate: boolean
  onRefresh: () => void
  onCreate: () => void
}

export function UsersToolbar({ loading, working, canCreate, onRefresh, onCreate }: UsersToolbarProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Gestión de usuarios</h2>
        <p className="mt-1 text-sm text-muted-foreground">Administrá las cuentas y sus permisos de acceso.</p>
      </div>
      <div className="flex gap-2">
        <Button size="lg" className="p-4 cursor-pointer" variant="outline" onClick={onRefresh} disabled={loading || working}>
          Refrescar
          <RefreshCwIcon className="ml-2 size-4 " aria-hidden />
        </Button>
        {canCreate &&
          <Button size="lg" className="p-4 cursor-pointer" onClick={onCreate} disabled={working}>
            Crear usuario
            <UserPlus2Icon className="ml-2 size-4 " aria-hidden />
          </Button>}
      </div>
    </div>
  )
}
