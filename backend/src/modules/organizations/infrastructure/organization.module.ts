import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import {
  OrganizationMembershipRepository,
  OrganizationRepository,
} from '../domain';
import {
  PrismaOrganizationMembershipRepository,
  PrismaOrganizationRepository,
} from './persistence';
import { OrganizationController } from './controllers';
import { UsersModule } from '../../users/infrastructure/users.module';

import {
  ActivateOrganizationUseCase,
  CreateOrganizationMembershipUseCase,
  CreateOrganizationUseCase,
  DeactivateOrganizationUseCase,
  GetOrganizationByIdUseCase,
  GetOrganizationMembershipsUseCase,
  ListOrganizationsUseCase,
  UpdateOrganizationUseCase,
  GetUserOrganizationsUseCase,
  UpdateOrganizationMembershipUseCase,
  RemoveOrganizationMembershipUseCase,
} from '../applications';

@Module({
  imports: [PrismaModule, UsersModule],
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
    {
      provide: OrganizationMembershipRepository,
      useClass: PrismaOrganizationMembershipRepository,
    },
    CreateOrganizationUseCase,
    ListOrganizationsUseCase,
    GetOrganizationByIdUseCase,
    UpdateOrganizationUseCase,

    ActivateOrganizationUseCase,
    DeactivateOrganizationUseCase,

    CreateOrganizationMembershipUseCase,
    GetOrganizationMembershipsUseCase,
    GetUserOrganizationsUseCase,
    UpdateOrganizationMembershipUseCase,
    RemoveOrganizationMembershipUseCase,
  ],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
