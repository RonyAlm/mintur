import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { RoleRepository } from '../domain';
import {
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
  UpdateRoleUseCase,
  RemovePermissionFromRoleUseCase,
  AssignPermissionToRoleUseCase,
} from '../application';
import { RolesController } from './controllers';
import { PrismaRoleRepository } from './persistence';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';
import { RolePermissionRepository } from '../../../modules/permissions/domain';
import { PrismaRolePermissionRepository } from '../../../modules/permissions/infrastructure/persistence';

@Module({
  imports: [PrismaModule, PermissionsModule],
  exports: [GetRoleByIdUseCase, ListRolesUseCase, UpdateRoleUseCase],
  providers: [
    {
      provide: RoleRepository,
      useClass: PrismaRoleRepository,
    },
    {
      provide: RolePermissionRepository,
      useClass: PrismaRolePermissionRepository,
    },
    CreateRoleUseCase,
    GetRoleByIdUseCase,
    ListRolesUseCase,
    UpdateRoleUseCase,

    AssignPermissionToRoleUseCase,
    RemovePermissionFromRoleUseCase,
  ],
  controllers: [RolesController],
})
export class RolesModule {}
