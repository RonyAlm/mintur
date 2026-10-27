import {
  OrganizationMembership,
  Organization,
} from '../../../../core/lib/generated/prisma/client';
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

interface OrganizationMembershipWithOrganization extends OrganizationMembershipTable {
  organization: Organization;
}

interface OrganizationMembershipWithUser extends OrganizationMembershipTable {
  user: { id: string; email: string; username: string };
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

  static toDomainWithOrganization(raw: OrganizationMembershipWithOrganization) {
    return {
      ...this.toDomain(raw),
      organization: {
        id: raw.organization.id,
        name: raw.organization.name,
        type: raw.organization.type,
        description: raw.organization.description || '',
        isActive: raw.organization.isActive,
        createdAt: raw.organization.createdAt,
        updatedAt: raw.organization.updatedAt,
      },
    };
  }

  static toDomainListWithOrganization(
    raw: OrganizationMembershipWithOrganization[],
  ) {
    return raw.map((organization) =>
      this.toDomainWithOrganization(organization),
    );
  }

  static toDomainWithUser(raw: OrganizationMembershipWithUser) {
    return {
      ...this.toDomain(raw),
      user: {
        id: raw.user.id,
        email: raw.user.email,
        username: raw.user.username,
      },
    };
  }

  static toDomainListWithUser(raw: OrganizationMembershipWithUser[]) {
    return raw.map((organization) => this.toDomainWithUser(organization));
  }
}
