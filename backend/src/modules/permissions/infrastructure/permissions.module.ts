import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { PermissionRepository, RolePermissionRepository } from '../domain';
import {
  PrismaPermissionRepository,
  PrismaRolePermissionRepository,
} from './persistence';
import { PermissionsController } from './controllers';
import {
  CreatePermissionUseCase,
  GetPermissionByIdUseCase,
  GetPermissionsByRoleIdUseCase,
  ListPermissionsUseCase,
} from '../applications';

@Module({
  imports: [PrismaModule],
  exports: [
    RolePermissionRepository,
    ListPermissionsUseCase,
    GetPermissionByIdUseCase,
    CreatePermissionUseCase,
    GetPermissionsByRoleIdUseCase,
  ],
  providers: [
    {
      provide: PermissionRepository,
      useClass: PrismaPermissionRepository,
    },
    {
      provide: RolePermissionRepository,
      useClass: PrismaRolePermissionRepository,
    },
    CreatePermissionUseCase,
    GetPermissionByIdUseCase,
    ListPermissionsUseCase,
    GetPermissionsByRoleIdUseCase,
  ],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
