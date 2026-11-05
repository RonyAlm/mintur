import type {
  AccommodationAgeRange,
  AccommodationOriginType,
  AccommodationTravelPurpose,
} from "../types/accommodation-statistics.types"

export const ageLabels: Record<AccommodationAgeRange, string> = {
  AGE_0_12: "Hasta 12 años", AGE_13_17: "13 a 17 años", AGE_18_30: "18 a 30 años",
  AGE_31_45: "31 a 45 años", AGE_46_60: "46 a 60 años", AGE_61_PLUS: "61 años o más",
}

export const purposeLabels: Record<AccommodationTravelPurpose, string> = {
  TOURISM: "Turismo", WORK: "Trabajo", BUSINESS: "Negocios", VISIT_FAMILY: "Visita familiar",
  STUDIES: "Estudios", HEALTH: "Salud", EVENTS: "Eventos", OTHER: "Otro",
}

export const originTypeLabels: Record<AccommodationOriginType, string> = {
  PROVINCE: "Provincia",
  COUNTRY: "País",
}
