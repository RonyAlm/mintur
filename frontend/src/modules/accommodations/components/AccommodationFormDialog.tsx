
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"

import { accommodationsApi } from "../api/accommodations.api"
import {
  accommodationFormSchema,
  type CreateAccommodationFormValues,
} from "../schemas/accommodation.schema"
import {
  AccommodationType,
  type Accommodation,
  type CreateAccommodationInput,
  type UpdateAccommodationInput,
} from "../types/accommodation.types"
import { Tabs, TabsContent } from "@/components/ui/tabs"

type FormValues = CreateAccommodationFormValues

const accommodationTypes = [
  { value: AccommodationType.HOTEL, label: "Hotel" },
  { value: AccommodationType.APART_HOTEL, label: "Apart hotel" },
  { value: AccommodationType.HOSTEL, label: "Hostel" },
  { value: AccommodationType.OTHER, label: "Otro" },
]
const accommodationTypeValues = accommodationTypes.map(({ value }) => value)
const localities = [
  "Formosa", "Clorinda", "Pirané", "El Colorado", "Ingeniero Juárez", "Las Lomitas",
  "Ibarreta", "Laguna Blanca", "Comandante Fontana", "Palo Santo", "Villa General Güemes",
  "Villa Dos Trece", "Misión San Francisco de Laishí", "Estanislao del Campo", "Pozo del Tigre",
  "Mayor Vicente Villafañe", "Riacho He-Hé", "El Espinillo", "General Manuel Belgrano",
  "Laguna Yema", "San Martín 2", "General Lucio V. Mansilla", "Herradura", "Villa del Carmen",
  "El Potrillo", "Misión Tacaaglé", "Laguna Naineck", "General Enrique Mosconi", "Tres Lagunas",
  "Fortín Lugones", "Villa Escolar", "Los Chiriguanos", "Subteniente Perín", "Palma Sola",
  "Mojón de Fierro", "Colonia Pastoril", "Gran Guardia", "Buena Vista", "Siete Palmas",
  "Pozo de Maza", "San Hilario", "Riacho Negro", "San Martín 1", "Tatané", "Portón Negro",
  "Posta Cambio Zalazar", "Pozo del Mortero", "Banco Payaguá", "Bartolomé de las Casas",
  "Colonia Sarmiento", "El Recreo", "Fortín Sargento 1º Leyes", "Laguna Gallo", "Mariano Boedo",
  "El Chorro",
]

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
}

interface AccommodationFormDialogProps {
  open: boolean
  accommodation?: Accommodation | null
  onOpenChange: (open: boolean) => void
  onSaved: () => Promise<void> | void
}

const emptyValues: FormValues = {
  organizationName: "",
  organizationDescription: "",
  type: AccommodationType.HOTEL,
  capacity: "",
  totalRooms: "",
  totalBeds: "",
  locality: "",
  image: "",
  address: "",
  addressMap: "",
  phoneOne: "",
  phoneTwo: "",
  email: "",
  website: "",
  instagram: "",
  facebook: "",
}

function optionalText(value: string) {
  return value.trim() || undefined
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined
  const number = Number(value)
  return Number.isFinite(number) && number >= 0 ? number : undefined
}

export function AccommodationFormDialog({
  open,
  accommodation,
  onOpenChange,
  onSaved,
}: AccommodationFormDialogProps) {
  const editing = Boolean(accommodation)
  const [step, setStep] = useState<typeof steps[number]>("organization")
  const steps = ["organization", "general", "address", "contacts"] as const
  const allowSubmitRef = useRef(false)

  const form = useForm<FormValues>({
    resolver: zodResolver(accommodationFormSchema),
    defaultValues: emptyValues,
  })

  useEffect(() => {
    if (!open) return
    setStep("organization")

    form.reset(
      accommodation
        ? {
            organizationName: accommodation.organization.name,
            organizationDescription:
              accommodation.organization.description ?? "",
            type: accommodation.type,
            capacity: accommodation.capacity?.toString() ?? "",
            totalRooms: accommodation.totalRooms?.toString() ?? "",
            totalBeds: accommodation.totalBeds?.toString() ?? "",
            locality: accommodation.locality ?? "",
            image: accommodation.image ?? "",
            address: accommodation.address ?? "",
            addressMap: accommodation.addressMap ?? "",
            phoneOne: accommodation.phoneOne ?? "",
            phoneTwo: accommodation.phoneTwo ?? "",
            email: accommodation.email ?? "",
            website: accommodation.website ?? "",
            instagram: accommodation.instagram ?? "",
            facebook: accommodation.facebook ?? "",
          }
        : emptyValues,
    )
  }, [open, accommodation, form])

  const onSubmit = form.handleSubmit(async (values) => {
    form.clearErrors("root")

    const organization = {
      name: values.organizationName.trim(),
      description: values.organizationDescription.trim(),
    }

    const accommodationData = {
      type: values.type,
      capacity: optionalNumber(values.capacity),
      totalRooms: optionalNumber(values.totalRooms),
      totalBeds: optionalNumber(values.totalBeds),
      locality: optionalText(values.locality),
      image: optionalText(values.image),
      address: optionalText(values.address),
      addressMap: optionalText(values.addressMap),
      phoneOne: optionalText(values.phoneOne),
      phoneTwo: optionalText(values.phoneTwo),
      email: optionalText(values.email),
      website: optionalText(values.website),
      instagram: optionalText(values.instagram),
      facebook: optionalText(values.facebook),
    }

    try {
      if (accommodation) {
        const input: UpdateAccommodationInput = {
          organization,
          ...accommodationData,
        }
        await accommodationsApi.update(accommodation.id, input)
      } else {
        const input: CreateAccommodationInput = {
          organization,
          ...accommodationData,
        }
        await accommodationsApi.create(input)
      }

      toast.success(
        accommodation
          ? "Alojamiento editado correctamente."
          : "Alojamiento guardado correctamente.",
      )
      onOpenChange(false)
      await onSaved()
    } catch (error) {
      form.setError("root", {
        message:
          error instanceof Error
            ? error.message
            : "No se pudo guardar el alojamiento.",
      })
    }
  })

  const nextStep = async () => {
    const fieldsByStep = {
      organization: ["organizationName"],
      general: ["type", "capacity", "totalRooms", "totalBeds", "image"],
      address: ["locality", "address", "addressMap"],
      contacts: ["phoneOne", "phoneTwo", "email", "website", "instagram", "facebook"],
    } as const
    if (!(await form.trigger(fieldsByStep[step]))) return
    const index = steps.indexOf(step)
    if (index < steps.length - 1) setStep(steps[index + 1])
  }

  const fieldsAccommodation: {
    name: Exclude<keyof FormValues, "organizationName" | "organizationDescription" | "type">
    label: string
    type?: string
  }[] = [
    { name: "capacity", label: "Capacidad (plazas)", type: "number" },
    { name: "totalRooms", label: "Habitaciones", type: "number" },
    { name: "totalBeds", label: "Camas", type: "number" },
    { name: "image", label: "URL de imagen", type: "url" },
    
  ]

  const fieldsContact: {
    name: Exclude<keyof FormValues, 
       "organizationName" | "organizationDescription"
     | "type" | "capacity" | "totalRooms" | "totalBeds"
     | "locality" | "address" | "addressMap"  >
    label: string
    type?: string
  }[] = [
    { name: "phoneOne", label: "Teléfono principal", type: "tel" },
    { name: "phoneTwo", label: "Teléfono secundario", type: "tel" },
    { name: "email", label: "Correo electrónico", type: "email" },
    { name: "website", label: "Sitio web", type: "url" },
    { name: "instagram", label: "Instagram" },
    { name: "facebook", label: "Facebook" },
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {editing ? "Editar alojamiento" : "Nuevo alojamiento"}
          </DialogTitle>
          <DialogDescription>
            Completá los datos de la organización y del establecimiento.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={(event) => {
            event.preventDefault()
            if (!allowSubmitRef.current) return
            allowSubmitRef.current = false
            void onSubmit(event)
          }}
          className="space-y-6"
        >
          <Tabs value={step}>
          <ol aria-label="Pasos del formulario" className="grid grid-cols-4 gap-2 text-center text-xs">
            {steps.map((value, index) => (
              <li key={value} aria-current={step === value ? "step" : undefined} className={step === value ? "border-b-2 border-primary pb-2 font-semibold text-foreground" : "border-b pb-2 text-muted-foreground"}>
                <span className="mr-1">{index + 1}.</span>{["Organización", "Alojamiento", "Dirección", "Contactos"][index]}
              </li>
            ))}
          </ol>
          <TabsContent value="organization">
            <section className="space-y-4 py-8">
              {/* <h3 className="font-semibold">Organización</h3> */}

              <div className="space-y-2">
                <Label htmlFor="organizationName">Nombre *</Label>
                <Input
                  id="organizationName"
                  {...form.register("organizationName")}
                />
                {form.formState.errors.organizationName && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.organizationName.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="organizationDescription">Descripción</Label>
                <Textarea
                  id="organizationDescription"
                  {...form.register("organizationDescription")}
                />
              </div>
            </section>
          </TabsContent>

          <TabsContent value="general">
              <section className="space-y-4">
                <div className="space-y-2 my-4">
                  <Label htmlFor="type">Tipo de Alojamiento *</Label>
                  <Combobox
                    items={accommodationTypeValues}
                    value={form.watch("type")}
                    itemToStringLabel={(value) =>
                      accommodationTypes.find((item) => item.value === value)?.label ?? ""
                    }
                    filter={(value, query, itemToString) =>
                      normalizeSearchText(itemToString?.(value) ?? String(value)).includes(
                        normalizeSearchText(query),
                      )
                    }
                    onValueChange={(value) => {
                      if (value) {
                        form.setValue("type", value as AccommodationType, {
                          shouldDirty: true,
                          shouldValidate: true,
                        })
                      }
                    }}
                  >
                    <ComboboxInput
                      id="type"
                      aria-label="Tipo de alojamiento"
                      placeholder="Selecciona un tipo"
                      className="w-full"
                    >
                      <ComboboxContent>
                        <ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty>
                        <ComboboxList>
                          {(value) => (
                            <ComboboxItem key={value} value={value}>
                              {accommodationTypes.find((item) => item.value === value)?.label}
                            </ComboboxItem>
                          )}
                        </ComboboxList>
                      </ComboboxContent>
                    </ComboboxInput>
                  </Combobox>
                  {form.formState.errors.type && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.type.message}
                    </p>
                  )}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {fieldsAccommodation.map((field) => {
                    const errorMessage = form.formState.errors[field.name]?.message

                    return (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Input
                          id={field.name}
                          type={field.type ?? "text"}
                          min={field.type === "number" ? 0 : undefined}
                          {...form.register(field.name)}
                        />
                        {errorMessage && (
                          <p className="text-sm text-destructive">{errorMessage}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </section>
          </TabsContent>

          <TabsContent value="address">
            <section className="space-y-4 py-8">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="locality">Localidad</Label>
                  <Combobox items={localities} value={form.watch("locality") || null}
                    filter={(value, query) => normalizeSearchText(value).includes(normalizeSearchText(query))}
                    onValueChange={(value) => form.setValue("locality", value ?? "", { shouldDirty: true, shouldValidate: true })}>
                    <ComboboxInput id="locality" aria-label="Localidad" placeholder="Selecciona una localidad" className="w-full">
                      <ComboboxContent><ComboboxEmpty>No se encontraron resultados.</ComboboxEmpty><ComboboxList>
                        {(locality) => <ComboboxItem key={locality} value={locality}>{locality}</ComboboxItem>}
                      </ComboboxList></ComboboxContent>
                    </ComboboxInput>
                  </Combobox>
                  {form.formState.errors.locality && <p className="text-sm text-destructive">{form.formState.errors.locality.message}</p>}
                </div>
                <div className="space-y-2"><Label htmlFor="address">Dirección</Label><Input id="address" {...form.register("address")} />
                  {form.formState.errors.address && <p className="text-sm text-destructive">{form.formState.errors.address.message}</p>}
                </div>
                <div className="space-y-2"><Label htmlFor="addressMap">Enlace al mapa</Label><Input id="addressMap" type="url" {...form.register("addressMap")} />
                  {form.formState.errors.addressMap && <p className="text-sm text-destructive">{form.formState.errors.addressMap.message}</p>}
                </div>
              </div>
            </section>
          </TabsContent>

          <TabsContent value="contacts">
            <section className="space-y-4 py-8">
              
                <div className="grid gap-4 sm:grid-cols-2">
                  {fieldsContact.map((field) => {
                    const errorMessage = form.formState.errors[field.name]?.message

                    return (
                      <div key={field.name} className="space-y-2">
                        <Label htmlFor={field.name}>{field.label}</Label>
                        <Input
                          id={field.name}
                          type={field.type ?? "text"}
                          min={field.type === "number" ? 0 : undefined}
                          {...form.register(field.name)}
                        />
                        {errorMessage && (
                          <p className="text-sm text-destructive">{errorMessage}</p>
                        )}
                      </div>
                    )
                  })}
                </div>
            </section>
          </TabsContent>

              {form.formState.errors.root?.message && (
                <p role="alert" className="text-sm text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}

            

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={form.formState.isSubmitting}
              >
                Cancelar
              </Button>
              {step !== "organization" && <Button type="button" variant="outline" onClick={() => setStep(steps[steps.indexOf(step) - 1])} disabled={form.formState.isSubmitting}>Anterior</Button>}
              {step === "contacts" ? (
                <Button type="submit" onClick={() => { allowSubmitRef.current = true }} disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Guardando..." : editing ? "Guardar cambios" : "Crear alojamiento"}
                </Button>
              ) : <Button type="button" onClick={nextStep}>Siguiente</Button>}
            </DialogFooter>
           
          </Tabs>
        </form>
      </DialogContent>
    </Dialog>
  )
}
