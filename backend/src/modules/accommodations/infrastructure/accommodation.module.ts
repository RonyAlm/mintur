import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { AccommodationRepository } from '../domain';
import { PrismaAccommodationRepository } from './persistence/prisma-accommodation.repository';
import { CreateAccommodationUseCase } from '../application/use-cases';
import { OrganizationModule } from '../../../modules/organizations/infrastructure/organization.module';
import { AccommodationController } from './controllers';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';

@Module({
  imports: [PrismaModule, OrganizationModule, PermissionsModule],
  controllers: [AccommodationController],
  providers: [
    {
      provide: AccommodationRepository,
      useClass: PrismaAccommodationRepository,
    },
    CreateAccommodationUseCase,
  ],
  exports: [],
})
export class AccommodationModule {}
