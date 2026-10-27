import {
  OrganizationMembership,
  OrganizationMembershipWithOrganization,
  OrganizationMembershipWithUser,
} from '../entities';

export abstract class OrganizationMembershipRepository {
  abstract create(
    membership: OrganizationMembership,
  ): Promise<OrganizationMembership>;

  abstract findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null>;

  abstract findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMembershipWithUser[] | []>;

  abstract findByUserId(
    userId: string,
  ): Promise<OrganizationMembershipWithOrganization[] | []>;

  abstract update(
    membership: OrganizationMembership,
  ): Promise<OrganizationMembership>;

  abstract delete(userId: string, organizationId: string): Promise<void>;
}
