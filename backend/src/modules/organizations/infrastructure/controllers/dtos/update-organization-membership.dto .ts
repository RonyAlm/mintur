import { IsEnum } from 'class-validator';
import { OrganizationMemberRole } from '../../../../../modules/organizations/domain';

export class UpdateOrganizationMembershipDto {
  @IsEnum(OrganizationMemberRole)
  role!: OrganizationMemberRole;
}
