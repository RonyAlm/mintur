import { IsEnum, IsUUID } from 'class-validator';
import { OrganizationMemberRole } from '../../../../../modules/organizations/domain';

export class CreateOrganizationMembershipDto {
  @IsUUID()
  userId!: string;

  @IsEnum(OrganizationMemberRole)
  role!: OrganizationMemberRole;
}
