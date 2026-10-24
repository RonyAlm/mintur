import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import type { Accommodation } from "../types/accommodation.types"

interface AccommodationDetailDialogProps {
  accommodation: Accommodation | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value?: string | number | null
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="text-sm font-medium break-words">
        {value === null || value === undefined || value === ""
          ? "No especificado"
          : value}
      </p>
    </div>
  )
}

const typeLabels: Record<string, string> = {
  HOTEL: "Hotel",
  APART_HOTEL: "Apart hotel",
  HOSTEL: "Hostel",
  OTRO: "Otro",
  OTHER: "Otro",
}

export function AccommodationDetailDialog({
  accommodation,
  open,
  onOpenChange,
}: AccommodationDetailDialogProps) {
  if (!accommodation) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {accommodation.organization.name}
          </DialogTitle>
          <DialogDescription>
            Detalle del establecimiento de alojamiento turístico.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Organización</h3>
            <DetailItem
              label="Descripción"
              value={accommodation.organization.description}
            />
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Alojamiento</h3>
              <Badge variant={accommodation.isActive ? "secondary" : "outline"}>
                {accommodation.isActive ? "Activo" : "Inactivo"}
              </Badge>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Tipo"
                value={typeLabels[accommodation.type] ?? accommodation.type}
              />
              <DetailItem label="Localidad" value={accommodation.locality} />
              <DetailItem label="Dirección" value={accommodation.address} />
              <DetailItem label="Capacidad (plazas)" value={accommodation.capacity} />
              <DetailItem label="Habitaciones" value={accommodation.totalRooms} />
              <DetailItem label="Camas" value={accommodation.totalBeds} />
            </div>
          </section>

          <section className="space-y-3">
            <h3 className="text-sm font-semibold">Contacto</h3>
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem label="Teléfono principal" value={accommodation.phoneOne} />
              <DetailItem label="Teléfono secundario" value={accommodation.phoneTwo} />
              <DetailItem label="Correo electrónico" value={accommodation.email} />
              <DetailItem label="Sitio web" value={accommodation.website} />
              <DetailItem label="Instagram" value={accommodation.instagram} />
              <DetailItem label="Facebook" value={accommodation.facebook} />
              <DetailItem label="Mapa" value={accommodation.addressMap} />
            </div>
          </section>
        </div>
      </DialogContent>
    </Dialog>
  )
}
