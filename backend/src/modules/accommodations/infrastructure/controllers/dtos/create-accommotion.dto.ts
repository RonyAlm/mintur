import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { AccommodationType } from '../../../domain';
import { Type } from 'class-transformer';

class OrganizationDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateAccommodationDto {
  @IsNotEmpty()
  @ValidateNested()
  @Type(() => OrganizationDto)
  organization!: OrganizationDto;

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
