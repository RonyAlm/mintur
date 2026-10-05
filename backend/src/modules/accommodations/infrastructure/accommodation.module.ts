import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { AccommodationRepository } from '../domain';
import { PrismaAccommodationRepository } from './persistence/prisma-accommodation.repository';
import {
  ActivateAccommodationUseCase,
  CreateAccommodationUseCase,
  DeactivateAccommodationUseCase,
  GetAccommodationByIdUseCase,
  ListAccommodationsUseCase,
  UpdateAccommodationUseCase,
} from '../application/use-cases';
import { AccommodationController } from './controllers';
import { OrganizationModule } from '../../../modules/organizations/infrastructure/organization.module';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';
import { GetAccommodationByOrganizationIdUseCase } from '../application/use-cases/get-accommodation-by-organization-id.use-case';

@Module({
  imports: [
    PrismaModule,
    OrganizationModule,
    PermissionsModule,
    OrganizationModule,
  ],
  controllers: [AccommodationController],
  providers: [
    {
      provide: AccommodationRepository,
      useClass: PrismaAccommodationRepository,
    },
    CreateAccommodationUseCase,
    GetAccommodationByIdUseCase,
    ListAccommodationsUseCase,
    UpdateAccommodationUseCase,
    ActivateAccommodationUseCase,
    DeactivateAccommodationUseCase,
    GetAccommodationByOrganizationIdUseCase,
  ],
  exports: [
    AccommodationRepository,
    CreateAccommodationUseCase,
    GetAccommodationByIdUseCase,
    ListAccommodationsUseCase,
    UpdateAccommodationUseCase,
    ActivateAccommodationUseCase,
    DeactivateAccommodationUseCase,
    GetAccommodationByOrganizationIdUseCase,
  ],
})
export class AccommodationModule {}
