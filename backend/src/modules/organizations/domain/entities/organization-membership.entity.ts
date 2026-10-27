import { Organization } from './organization.entity';

export const OrganizationMemberRole = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  OPERATOR: 'OPERATOR',
} as const;

export type OrganizationMemberRole =
  (typeof OrganizationMemberRole)[keyof typeof OrganizationMemberRole];

export interface OrganizationMembership {
  organizationId: string;
  userId: string;
  role: OrganizationMemberRole;
  createdAt: Date;
  updatedAt: Date;
}

export type OrganizationMembershipWithOrganization = OrganizationMembership & {
  organization: Organization;
};

export type OrganizationMembershipWithUser = OrganizationMembership & {
  user: { id: string; email: string; username: string };
};
