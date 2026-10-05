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
  OrganizationAccessService,
  GetMyOrganizationsUseCase,
} from '../applications';
import { UsersModule } from '../../users/infrastructure/users.module';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';
import { RolesModule } from '../../../modules/roles/infrastructure/roles.module';

@Module({
  imports: [PrismaModule, UsersModule, PermissionsModule, RolesModule],
  exports: [
    OrganizationRepository,
    OrganizationMembershipRepository,
    CreateOrganizationUseCase,
    ListOrganizationsUseCase,
    GetOrganizationByIdUseCase,
    UpdateOrganizationUseCase,

    ActivateOrganizationUseCase,
    DeactivateOrganizationUseCase,

    CreateOrganizationMembershipUseCase,
    OrganizationAccessService,
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
    OrganizationAccessService,
    GetMyOrganizationsUseCase,
  ],
  controllers: [OrganizationController],
})
export class OrganizationModule {}
