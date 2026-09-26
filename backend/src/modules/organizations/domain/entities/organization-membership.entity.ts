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
