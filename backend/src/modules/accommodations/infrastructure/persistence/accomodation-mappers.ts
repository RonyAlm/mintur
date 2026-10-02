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

export class AccommodationMapper {
  static toDomain(raw: AccommodationTable): AccommodationEntity {
    return {
      id: raw.id,
      organizationId: raw.organizationId,
      type: raw.type as AccommodationTypeEntity,
      image: raw.image,
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

  static toDomainList(raws: AccommodationTable[]): AccommodationEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }

  static toPersistence(raw: AccommodationEntity): AccommodationTable {
    return raw as AccommodationTable;
  }
}
