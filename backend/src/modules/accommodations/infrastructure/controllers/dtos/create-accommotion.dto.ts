import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';
import { AccommodationType } from '../../../domain';

export class CreateAccommodationDto {
  @IsNotEmpty()
  organizationId!: string;

  @IsEnum(AccommodationType)
  type!: AccommodationType;

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
  @IsPhoneNumber()
  phoneOne?: string;

  @IsOptional()
  @IsPhoneNumber()
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
