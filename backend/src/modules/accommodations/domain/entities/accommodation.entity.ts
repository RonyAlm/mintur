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
  image?: string;
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
