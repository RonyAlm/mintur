import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { OrganizationType } from 'src/modules/organizations/domain';

export class CreateOrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description!: string;

  @IsEnum(OrganizationType)
  type!: OrganizationType;
}
