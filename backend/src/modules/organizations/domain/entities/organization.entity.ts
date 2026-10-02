export const OrganizationType = {
  MINISTRY: 'MINISTRY',
  ACCOMMODATION: 'ACCOMMODATION',
  AGENCY: 'AGENCY',
  TOURISM_PROVIDER: 'TOURISM_PROVIDER',
  GASTRONOMY: 'GASTRONOMY',
  TRANSPORTATION: 'TRANSPORTATION',
  OTHER: 'OTHER',
} as const;

export type OrganizationType =
  (typeof OrganizationType)[keyof typeof OrganizationType];

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
