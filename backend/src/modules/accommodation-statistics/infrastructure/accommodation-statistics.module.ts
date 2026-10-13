import { Module } from '@nestjs/common';
import { AccommodationModule } from '../../../modules/accommodations/infrastructure/accommodation.module';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';
import { OrganizationModule } from '../../../modules/organizations/infrastructure/organization.module';
import { UsersModule } from '../../../modules/users/infrastructure';
import { PrismaAccommodationStatisticRepository } from './persistence';
import { AccommodationStatisticRepository } from '../domain';
import { AccommodationStatisticsController } from './controllers';
import {
  CreateAccommodationDailyStatisticUseCase,
  GetAccommodationDailyStatisticUseCase,
  GetAccommodationStatisticsByAccommodationUseCase,
  GetAccommodationStatisticsSummaryUseCase,
  GetAllAccommodationsStatisticsSummaryUseCase,
  UpdateAccommodationDailyStatisticUseCase,
} from '../application';

@Module({
  imports: [
    AccommodationModule,
    OrganizationModule,
    UsersModule,
    PermissionsModule,
  ],
  controllers: [AccommodationStatisticsController],
  providers: [
    {
      provide: AccommodationStatisticRepository,
      useClass: PrismaAccommodationStatisticRepository,
    },
    CreateAccommodationDailyStatisticUseCase,
    GetAccommodationDailyStatisticUseCase,
    GetAccommodationStatisticsByAccommodationUseCase,
    UpdateAccommodationDailyStatisticUseCase,
    GetAccommodationStatisticsSummaryUseCase,
    GetAllAccommodationsStatisticsSummaryUseCase,
  ],
  exports: [
    AccommodationStatisticRepository,
    CreateAccommodationDailyStatisticUseCase,
    GetAccommodationDailyStatisticUseCase,
    GetAccommodationStatisticsByAccommodationUseCase,
    UpdateAccommodationDailyStatisticUseCase,
    GetAccommodationStatisticsSummaryUseCase,
  ],
})
export class AccommodationStatisticsModule {}
