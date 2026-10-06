import { IsDateString, IsOptional } from 'class-validator';

export class GetAccommodationStatisticsQueryDto {
  @IsOptional()
  @IsDateString()
  from?: string;

  @IsOptional()
  @IsDateString()
  to?: string;
}
