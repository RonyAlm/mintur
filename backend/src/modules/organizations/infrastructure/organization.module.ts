import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { OrganizationRepository } from '../domain';
import { PrismaOrganizationRepository } from './persistence';
import { OrganizationController } from './controllers';
import {
  ActivateOrganizationUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  ListOrganizationsUseCase,
  UpdateOrganizationUseCase,
} from '../applications';

@Module({
  imports: [PrismaModule],
  exports: [
    OrganizationRepository,
    CreateOrganizationUseCase,
    ListOrganizationsUseCase,
    GetOrganizationByIdUseCase,
  ],
  providers: [
    {
      provide: OrganizationRepository,
      useClass: PrismaOrganizationRepository,
    },
    CreateOrganizationUseCase,
    ListOrganizationsUseCase,
    GetOrganizationByIdUseCase,
    UpdateOrganizationUseCase,

    ActivateOrganizationUseCase,
    DeactivateOrganizationUseCase,
  ],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
