import { BellIcon, TriangleAlertIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { LoadAlert } from "../types/dashboard.types"

interface NotificationsMenuProps {
  alerts: LoadAlert[]
}

export default function NotificationsMenu({ alerts }: NotificationsMenuProps) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="relative"
            aria-label={alerts.length > 0 ? `Notificaciones (${alerts.length})` : "Notificaciones"}
          />
        }
      >
        <BellIcon className="size-4" aria-hidden="true" />
        {alerts.length > 0 && (
          <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] font-semibold text-white">
            {alerts.length}
          </span>
        )}
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        <div className="border-b px-4 py-3">
          <p className="text-sm font-semibold">Alertas de carga</p>
          <p className="text-xs text-muted-foreground">
            Alojamientos que llevan varios días sin cargar estadísticas.
          </p>
        </div>

        {alerts.length === 0 ? (
          <p className="px-4 py-6 text-center text-sm text-muted-foreground">
            Todo al día, sin alertas.
          </p>
        ) : (
          <ul className="max-h-72 overflow-y-auto p-2">
            {alerts.map((alert) => (
              <li key={alert.accommodationId} className="flex items-start gap-2 rounded-md px-2 py-2">
                <TriangleAlertIcon
                  className="mt-0.5 size-4 shrink-0 text-amber-500"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{alert.accommodationName}</p>
                  <p className="text-xs text-muted-foreground">
                    {alert.daysSinceLoad === null
                      ? "Sin cargas recientes"
                      : `Hace ${alert.daysSinceLoad} días sin cargar`}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PopoverContent>
    </Popover>
  )
}
