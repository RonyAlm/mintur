import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  CreateAccommodationDailyStatisticUseCase,
  GetAccommodationDailyStatisticUseCase,
  GetAccommodationStatisticsByAccommodationUseCase,
  GetAccommodationStatisticsSummaryUseCase,
  GetAllAccommodationsStatisticsSummaryUseCase,
  UpdateAccommodationDailyStatisticUseCase,
} from '../../application';
import { Auth } from '../../../../core/decorators';
import { type AuthenticatedUser } from '../../../../modules/auth/applications/types';
import { CurrentUser } from '../../../../modules/auth/infrastructure/decorators';
import {
  CreateAccommodationDailyStatisticDto,
  GetAccommodationStatisticsQueryDto,
  UpdateAccommodationDailyStatisticDto,
} from './dtos';
import {
  AccommodationStatisticAgeRange,
  AccommodationStatisticOrigin,
  AccommodationStatisticTravelPurpose,
} from '../../domain';

@Controller('accommodation-statistics')
export class AccommodationStatisticsController {
  constructor(
    private readonly createAccommodationDailyStatisticUseCase: CreateAccommodationDailyStatisticUseCase,
    private readonly getAccommodationDailyStatisticUseCase: GetAccommodationDailyStatisticUseCase,
    private readonly getAccommodationStatisticsByAccommodationUseCase: GetAccommodationStatisticsByAccommodationUseCase,
    private readonly updateAccommodationDailyStatisticUseCase: UpdateAccommodationDailyStatisticUseCase,
    private readonly getAccommodationStatisticsSummaryUseCase: GetAccommodationStatisticsSummaryUseCase,
    private readonly getAllAccommodationsStatisticsSummaryUseCase: GetAllAccommodationsStatisticsSummaryUseCase,
  ) {}

  @Get('/accommodation/:accommodationId')
  @Auth('accommodation-statistics:read')
  async getAccommodationStatisticsByAccommodation(
    @Param('accommodationId') accommodationId: string,
    @Query() query: GetAccommodationStatisticsQueryDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getAccommodationStatisticsByAccommodationUseCase.execute({
      currentUser,
      accommodationId,

      from: query.from ? new Date(query.from) : undefined,
      to: query.to ? new Date(query.to) : undefined,
    });
  }

  @Get('/accommodation/:accommodationId/summary')
  @Auth('accommodation-statistics:read')
  async getAccommodationStatisticsSummary(
    @Param('accommodationId') accommodationId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
    @Query() query: { from: string; to: string },
  ) {
    return this.getAccommodationStatisticsSummaryUseCase.execute({
      currentUser,
      accommodationId,

      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Get('/summary')
  @Auth('accommodation-statistics:read')
  async getAllAccommodationsStatisticsSummary(
    @Query() query: { from: string; to: string },
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getAllAccommodationsStatisticsSummaryUseCase.execute({
      currentUser,
      from: new Date(query.from),
      to: new Date(query.to),
    });
  }

  @Get(':statisticId')
  @Auth('accommodation-statistics:read')
  async getAccommodationDailyStatistic(
    @Param('statisticId') statisticId: string,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.getAccommodationDailyStatisticUseCase.execute({
      statisticId,
      currentUser,
    });
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

  @Patch(':statisticId')
  @Auth('accommodation-statistics:update')
  async updateAccommodationDailyStatistic(
    @Param('statisticId') statisticId: string,
    @Body() dto: UpdateAccommodationDailyStatisticDto,
    @CurrentUser() currentUser: AuthenticatedUser,
  ) {
    return this.updateAccommodationDailyStatisticUseCase.execute({
      statisticId,
      currentUser,

      totalGuests: dto.totalGuests,

      ageRanges: dto.ageRanges.map((ageRange) => ({
        statisticId,
        ageRange: ageRange.ageRange,
        quantity: ageRange.quantity,
      })),

      travelPurposes: dto.travelPurposes.map((travelPurpose) => ({
        statisticId,
        purpose: travelPurpose.purpose,
        quantity: travelPurpose.quantity,
      })),

      origins: dto.origins.map((origin) => ({
        statisticId,
        type: origin.type,
        name: origin.name,
        quantity: origin.quantity,
      })),
    });
  }
}
