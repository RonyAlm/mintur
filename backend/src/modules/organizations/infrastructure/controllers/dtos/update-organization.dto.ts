import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrganizationType } from '../../../../../modules/organizations/domain';

export class UpdateOrganizationDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  @IsEnum(OrganizationType)
  type?: OrganizationType;
}
