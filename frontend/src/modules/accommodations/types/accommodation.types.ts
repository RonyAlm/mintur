
export const AccommodationType = {
  HOTEL: "HOTEL",
  APART_HOTEL: "APART_HOTEL",
  HOSTEL: "HOSTEL",
  OTHER: "OTHER",
} as const

export type AccommodationType =
  (typeof AccommodationType)[keyof typeof AccommodationType]

export interface CreateAccommodationInput {
  organization: {
    name: string
    description?: string
  }
  type: AccommodationType
  capacity?: number
  totalRooms?: number
  totalBeds?: number
  locality?: string
  image?: string
  address?: string
  addressMap?: string
  phoneOne?: string
  phoneTwo?: string
  email?: string
  website?: string
  instagram?: string
  facebook?: string
}

export type UpdateAccommodationInput = Partial<CreateAccommodationInput>

export interface AccommodationOrganization {
  id: string
  name: string
  description: string | null
}

export interface Accommodation {
  id: string
  organizationId: string
  type: AccommodationType
  isActive: boolean
  capacity: number | null
  totalRooms: number | null
  totalBeds: number | null
  image: string | null
  locality: string | null
  address: string | null
  addressMap: string | null
  phoneOne: string | null
  phoneTwo: string | null
  email: string | null
  website: string | null
  instagram: string | null
  facebook: string | null
  createdAt: string
  updatedAt: string
  organization: AccommodationOrganization
}

