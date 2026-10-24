// export interface Accommodation {
//   id: string;
//   organizationId: string;
//   type: AccommodationType;

//   image: string;
//   address?: string;
//   addressMap?: string;
//   phoneOne?: string;
//   phoneTwo?: string;
//   email?: string;
//   website?: string;
//   instagram?: string;
//   facebook?: string;

//   createdAt: Date;
//   updatedAt: Date;
// }

export interface Accommodation {
  id: string;
  organizationId: string;
  type: AccommodationType;
  isActive: boolean;
  capacity?: number; // Plazas
  totalRooms?: number; // Habitaciones
  totalBeds?: number; // Camas
  image?: string;
  locality?: string;
  address?: string;
  addressMap?: string;
  phoneOne?: string;
  phoneTwo?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  createdAt: Date;
  updatedAt: Date;
}

export const AccommodationType = {
  HOTEL: 'HOTEL',
  APART_HOTEL: 'APART_HOTEL',
  HOSTEL: 'HOSTEL',
  OTHER: 'OTHER',
} as const;

export type AccommodationType =
  (typeof AccommodationType)[keyof typeof AccommodationType];

export type AccommodationWithOrganization = Accommodation & {
  organization: {
    id: string;
    name: string;
    description: string | null;
  };
};
