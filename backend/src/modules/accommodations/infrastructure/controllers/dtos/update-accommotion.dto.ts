import {
  IsEmail,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
  IsNumber,
} from 'class-validator';
import { AccommodationType } from '../../../domain';
import { Type } from 'class-transformer';

export class OrganizationDto {
  @IsString()
  @IsOptional()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateAccommodationDto {
  @IsOptional()
  @ValidateNested()
  @Type(() => OrganizationDto)
  organization!: OrganizationDto;

  @IsOptional()
  @IsEnum(AccommodationType)
  type!: AccommodationType;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsNumber()
  totalRooms?: number;

  @IsOptional()
  @IsNumber()
  totalBeds?: number;

  @IsOptional()
  @IsString()
  @MinLength(4)
  locality?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  @MinLength(4)
  address?: string;

  @IsOptional()
  @IsUrl()
  addressMap?: string;

  @IsOptional()
  @IsString()
  phoneOne?: string;

  @IsOptional()
  @IsString()
  phoneTwo?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  instagram?: string;

  @IsOptional()
  @IsString()
  facebook?: string;
}
