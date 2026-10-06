import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateAccommodationDailyStatisticUseCase } from '../../application';
import { Auth } from 'src/core/decorators';
import { type AuthenticatedUser } from 'src/modules/auth/applications/types';
import { CurrentUser } from 'src/modules/auth/infrastructure/decorators';
import { CreateAccommodationDailyStatisticDto } from './dtos';
import {
  AccommodationStatisticAgeRange,
  AccommodationStatisticOrigin,
  AccommodationStatisticTravelPurpose,
} from '../../domain';

@Controller('accommodation-statistics')
export class AccommodationStatisticsController {
  constructor(
    private readonly createAccommodationDailyStatisticUseCase: CreateAccommodationDailyStatisticUseCase,
  ) {}

  @Get()
  getAccommodationStatistics() {
    return [];
  }

  @Post()
  @Auth('accommodation-statistics:create')
  async createAccommodationDailyStatistic(
    @Body() dto: CreateAccommodationDailyStatisticDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.createAccommodationDailyStatisticUseCase.execute({
      currentUser,
      accommodationId: dto.accommodationId,
      date: new Date(dto.date),
      totalGuests: dto.totalGuests,

      ageRanges: dto.ageRanges.map((ageRange) => ({
        ageRange: ageRange.ageRange,
        quantity: ageRange.quantity,
      })) as AccommodationStatisticAgeRange[],

      travelPurposes: dto.travelPurposes.map((travelPurpose) => ({
        purpose: travelPurpose.purpose,
        quantity: travelPurpose.quantity,
      })) as AccommodationStatisticTravelPurpose[],

      origins: dto.origins.map((origin) => ({
        type: origin.type,
        name: origin.name,
        quantity: origin.quantity,
      })) as AccommodationStatisticOrigin[],
    });
  }
}
