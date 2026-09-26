import { OrganizationMembership } from '../../../../core/lib/generated/prisma/client';
import {
  OrganizationMembership as OrganizationMembershipEntity,
  OrganizationMemberRole,
} from '../../domain';

interface OrganizationMembershipTable extends OrganizationMembership {
  userId: string;
  organizationId: string;
  role: OrganizationMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export class OrganizationMembershipMapper {
  static toDomain(
    raw: OrganizationMembershipTable,
  ): OrganizationMembershipEntity {
    return {
      organizationId: raw.organizationId,
      userId: raw.userId,
      role: raw.role,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(
    raw: OrganizationMembershipTable[],
  ): OrganizationMembershipEntity[] {
    return raw.map((organization) => this.toDomain(organization));
  }
}
