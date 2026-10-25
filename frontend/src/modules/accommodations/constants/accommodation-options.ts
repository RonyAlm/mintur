import { AccommodationType } from "../types/accommodation.types"

export const accommodationTypes = [
  { value: AccommodationType.HOTEL, label: "Hotel" },
  { value: AccommodationType.APART_HOTEL, label: "Apart hotel" },
  { value: AccommodationType.HOSTEL, label: "Hostel" },
  { value: AccommodationType.OTHER, label: "Otro" },
] as const

export const accommodationTypeValues = accommodationTypes.map(({ value }) => value)

export const accommodationLocalities = [
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
] as const

export function normalizeAccommodationSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase()
}
