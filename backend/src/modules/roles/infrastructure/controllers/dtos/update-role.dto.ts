import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @IsNotEmpty()
  description?: string;
}
