import { Module } from '@nestjs/common';
import { AccommodationModule } from '../../../modules/accommodations/infrastructure/accommodation.module';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';
import { UsersModule } from '../../../modules/users/infrastructure';
import { PrismaAccommodationStatisticRepository } from './persistence';
import { AccommodationStatisticRepository } from '../domain';
import { AccommodationStatisticsController } from './controllers';
import { CreateAccommodationDailyStatisticUseCase } from '../application';
import { OrganizationModule } from 'src/modules/organizations/infrastructure/organization.module';

@Module({
  imports: [
    AccommodationStatisticsModule,
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
  ],
  exports: [
    AccommodationStatisticRepository,
    CreateAccommodationDailyStatisticUseCase,
  ],
})
export class AccommodationStatisticsModule {}
