import { Organization } from '../../../../core/lib/generated/prisma/client';
import {
  Organization as OrganizationEntity,
  OrganizationType,
} from '../../domain';

interface OrganizationTable extends Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationMapper {
  static toDomain(raw: OrganizationTable): OrganizationEntity {
    return {
      id: raw.id,
      name: raw.name,
      type: raw.type,
      description: raw.description || '',
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(raw: OrganizationTable[]): OrganizationEntity[] {
    return raw.map((organization) => this.toDomain(organization));
  }
}
