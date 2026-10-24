import {
  Accommodation,
  AccommodationType,
} from '../../../../core/lib/generated/prisma/client';
import {
  Accommodation as AccommodationEntity,
  AccommodationType as AccommodationTypeEntity,
} from '../../domain';

export interface AccommodationTable extends Accommodation {
  id: string;
  organizationId: string;
  type: AccommodationType;
  isActive: boolean;
  capacity: number | null;
  totalRooms: number | null;
  totalBeds: number | null;
  locality: string | null;
  image: string | null;
  address: string | null;
  addressMap: string | null;
  phoneOne: string | null;
  phoneTwo: string | null;
  email: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export type AccommodationWithOrganizationTable = AccommodationTable & {
  organization: {
    id: string;
    name: string;
    description: string | null;
  };
};

export class AccommodationMapper {
  static toDomain(raw: AccommodationTable): AccommodationEntity {
    return {
      id: raw.id,
      organizationId: raw.organizationId,
      type: raw.type as AccommodationTypeEntity,
      isActive: raw.isActive,
      capacity: raw.capacity,
      totalRooms: raw.totalRooms,
      totalBeds: raw.totalBeds,
      image: raw.image,
      locality: raw.locality,
      address: raw.address,
      addressMap: raw.addressMap,
      phoneOne: raw.phoneOne,
      phoneTwo: raw.phoneTwo,
      email: raw.email,
      website: raw.website,
      instagram: raw.instagram,
      facebook: raw.facebook,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as AccommodationEntity;
  }

  static toDomainWithOrganization(raw: AccommodationWithOrganizationTable) {
    return {
      ...this.toDomain(raw),
      organization: raw.organization,
    };
  }

  static toDomainList(raws: AccommodationTable[]): AccommodationEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }

  static toDomainListWithOrganization(
    raws: AccommodationWithOrganizationTable[],
  ) {
    return raws.map((raw) => this.toDomainWithOrganization(raw));
  }

  static toPersistence(raw: AccommodationEntity): AccommodationTable {
    return raw as AccommodationTable;
  }
}
