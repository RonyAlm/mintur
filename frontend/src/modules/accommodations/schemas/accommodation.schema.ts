
import { z } from "zod"
import { AccommodationType } from "../types/accommodation.types"

const optionalText = z.string().trim()
const optionalUrl = optionalText.refine(
  (value) => !value || z.string().url().safeParse(value).success,
  "Ingresá una URL válida",
)
const optionalEmail = optionalText.refine(
  (value) => !value || z.string().email().safeParse(value).success,
  "Ingresá un email válido",
)
const optionalNonNegativeNumber = optionalText.refine(
  (value) => !value || (Number.isFinite(Number(value)) && Number(value) >= 0),
  "Ingresá un número válido mayor o igual a cero",
)

/** Shared validation for the accommodation create and edit dialog. */
export const accommodationFormSchema = z.object({
  organizationName: z.string().trim().min(1, "El nombre es obligatorio"),
  organizationDescription: z.string(),
  type: z.nativeEnum(AccommodationType, {
    error: () => ({ message: "Seleccioná un tipo de alojamiento" }),
  }),
  capacity: optionalNonNegativeNumber,
  totalRooms: optionalNonNegativeNumber,
  totalBeds: optionalNonNegativeNumber,
  locality: optionalText,
  image: optionalUrl,
  address: optionalText,
  addressMap: optionalUrl,
  phoneOne: optionalText,
  phoneTwo: optionalText,
  email: optionalEmail,
  website: optionalUrl,
  instagram: optionalText,
  facebook: optionalText,
})

export const createAccommodationSchema = accommodationFormSchema
export const updateAccommodationSchema = accommodationFormSchema

export type CreateAccommodationFormValues = z.infer<
  typeof accommodationFormSchema
>
export type UpdateAccommodationFormValues = CreateAccommodationFormValues
