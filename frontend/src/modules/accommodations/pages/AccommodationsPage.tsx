
import { useState } from "react"
import { useNavigate } from "react-router"
import { Building2Icon, RefreshCwIcon } from "lucide-react"

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/modules/auth/hooks/useAuth"
import { hasPermission } from "@/lib/modules"

import type { Accommodation } from "../types/accommodation.types"
import { AccommodationsTable } from "../components/AccommodationsTable"
import { PlusIcon } from "lucide-react"
import { AccommodationFormDialog } from "../components/AccommodationFormDialog"
import { toast } from "sonner"
import { useAccommodations } from "../hooks/useAccommodations"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

export default function AccommodationsPage() {
    const { user } = useAuth()

    const navigate = useNavigate()
    const canRead = hasPermission(user, "accommodations:read")
    const {
        accommodations,
        loading,
        error,
        loadAccommodations,
        toggleAccommodation,
    } = useAccommodations(canRead)
    const [formOpen, setFormOpen] = useState(false)
    const [editingAccommodation, setEditingAccommodation] =
        useState<Accommodation | null>(null)
    const [accommodationToToggle, setAccommodationToToggle] =
        useState<Accommodation | null>(null)

    const canCreate = hasPermission(user, "accommodations:create")
    // const canUpdate = hasPermission(user, "accommodations:update")
    const canActivate = hasPermission(user, "accommodations:activate")
    const canDeactivate = hasPermission(user, "accommodations:deactivate")

    if (!canRead) {
        return (
            <div className="p-6">
                <Alert>
                    <AlertTitle>Acceso restringido</AlertTitle>
                    <AlertDescription>
                        No tenés permisos para consultar los alojamientos.
                    </AlertDescription>
                </Alert>
            </div>
        )
    }

    const handleToggleAccommodation = (accommodation: Accommodation) => {
        setAccommodationToToggle(accommodation)
    }

    const confirmToggleAccommodation = async () => {
        if (!accommodationToToggle) return

        const accommodation = accommodationToToggle
        setAccommodationToToggle(null)

        try {
            await toggleAccommodation(accommodation)

            toast.success(
                `Alojamiento ${accommodation.isActive ? "desactivado" : "activado"} correctamente`,
            )
        } catch {
            // The hook retains the API error for the page-level alert.
        }
    }

    return (
        <div className="space-y-6 p-4 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="space-y-1">
                    <div className="flex items-center gap-2">
                        <Building2Icon className="size-6 text-muted-foreground" />
                        <h1 className="text-2xl font-semibold tracking-tight">
                            Alojamientos
                        </h1>
                    </div>
                    <p className="text-sm text-muted-foreground">
                        Administrá los establecimientos de alojamiento turístico.
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        className="p-4 cursor-pointer"
                        size="lg"
                        variant="outline"
                        onClick={() => void loadAccommodations()}
                        disabled={loading}>
                        Refrescar
                        <RefreshCwIcon className="ml-2 size-4" />
                    </Button>
                     
                    {
                        canCreate &&
                        <Button
                            className="p-4 cursor-pointer"
                            size="lg"
                            onClick={() => {
                                setEditingAccommodation(null)
                                setFormOpen(true)
                            }}>
                            Nuevo alojamiento
                            <PlusIcon className="ml-2 size-4" />
                        </Button>
                    }
                </div>


            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertTitle>Error al cargar los alojamientos</AlertTitle>
                    <AlertDescription className="flex flex-col gap-3">
                        <p>{error}</p>
                        <div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => void loadAccommodations()}
                                disabled={loading}
                            >
                                Reintentar
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            )}

            <Card>
                <CardHeader>
                    <CardTitle className="text-base">
                        Listado de alojamientos
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                    <AccommodationsTable
                        accommodations={accommodations}
                        loading={loading}
                        onSelect={(accommodation) => navigate(`/alojamientos/${accommodation.id}`)}
                        onEdit={(accommodation) => {
                            setEditingAccommodation(accommodation)
                            setFormOpen(true)
                        }}
                        onToggleStatus={
                            (canActivate || canDeactivate) 
                            ? handleToggleAccommodation : undefined}
                    />
                </CardContent>
            </Card>
            <AccommodationFormDialog
                open={formOpen}
                accommodation={editingAccommodation}
                onOpenChange={(open) => {
                    setFormOpen(open)

                    if (!open) {
                        setEditingAccommodation(null)
                    }
                }}
                onSaved={loadAccommodations}
            />
            <AlertDialog
                open={accommodationToToggle !== null}
                onOpenChange={(open) => {
                    if (!open) setAccommodationToToggle(null)
                }}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {accommodationToToggle?.isActive ? "Desactivar" : "Activar"} alojamiento
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            ¿Querés {accommodationToToggle?.isActive ? "desactivar" : "activar"} el alojamiento
                            {accommodationToToggle && ` “${accommodationToToggle.organization.name}”`}?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmToggleAccommodation}>
                            Confirmar
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
