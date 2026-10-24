import { EyeIcon, MoreHorizontalIcon, PencilIcon, PowerIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

import type { Accommodation } from "../types/accommodation.types"

type AccommodationActionsMenuProps = {
  accommodation: Accommodation
  onSelect?: (accommodation: Accommodation) => void
  onEdit?: (accommodation: Accommodation) => void
  onToggleStatus?: (accommodation: Accommodation) => void
}

export function AccommodationActionsMenu({
  accommodation,
  onSelect,
  onEdit,
  onToggleStatus,
}: AccommodationActionsMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label={`Acciones para ${accommodation.organization.name}`}
          />
        }
      >
        <MoreHorizontalIcon aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {onSelect && (
          <DropdownMenuItem onClick={() => onSelect(accommodation)}>
            <EyeIcon aria-hidden="true" />
            Ver
          </DropdownMenuItem>
        )}
        {onEdit && (
          <DropdownMenuItem onClick={() => onEdit(accommodation)}>
            <PencilIcon aria-hidden="true" />
            Editar
          </DropdownMenuItem>
        )}
        {onToggleStatus && (
          <DropdownMenuItem onClick={() => onToggleStatus(accommodation)}>
            <PowerIcon aria-hidden="true" />
            {accommodation.isActive ? "Desactivar" : "Activar"}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
