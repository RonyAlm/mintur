import {
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

import {
  AccommodationAgeRange,
  AccommodationOriginType,
  AccommodationTravelPurpose,
} from '../../../domain/entities';

class AgeRangeDto {
  @IsEnum(AccommodationAgeRange)
  ageRange!: AccommodationAgeRange;

  @IsInt()
  @Min(0)
  quantity!: number;
}

class TravelPurposeDto {
  @IsEnum(AccommodationTravelPurpose)
  purpose!: AccommodationTravelPurpose;

  @IsInt()
  @Min(0)
  quantity!: number;
}

class OriginDto {
  @IsEnum(AccommodationOriginType)
  type!: AccommodationOriginType;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(0)
  quantity!: number;
}

export class UpdateAccommodationDailyStatisticDto {
  @IsOptional()
  @IsInt()
  @Min(0)
  totalGuests!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgeRangeDto)
  ageRanges!: AgeRangeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TravelPurposeDto)
  travelPurposes!: TravelPurposeDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OriginDto)
  origins!: OriginDto[];
}
