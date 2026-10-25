import type { CreateAccommodationFormValues } from "../schemas/accommodation.schema"
import type {
  Accommodation,
  CreateAccommodationInput,
} from "../types/accommodation.types"

export const emptyAccommodationFormValues: CreateAccommodationFormValues = {
  organizationName: "",
  organizationDescription: "",
  type: "HOTEL",
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

export function formValuesToAccommodationInput(
  values: CreateAccommodationFormValues,
): CreateAccommodationInput {
  return {
    organization: {
      name: values.organizationName.trim(),
      description: values.organizationDescription.trim(),
    },
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
}

export function accommodationToFormValues(
  accommodation: Accommodation,
): CreateAccommodationFormValues {
  return {
    organizationName: accommodation.organization.name,
    organizationDescription: accommodation.organization.description ?? "",
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
}
