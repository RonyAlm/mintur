import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { PermissionRepository } from '../domain';
import { PrismaPermissionRepository } from './persistence';
import { PermissionsController } from './controllers';
import {
  CreatePermissionUseCase,
  GetPermissionByIdUseCase,
  ListPermissionsUseCase,
} from '../applications';

@Module({
  imports: [PrismaModule],
  //   exports: [GetRoleByIdUseCase, ListRolesUseCase, UpdateRoleUseCase],
  providers: [
    {
      provide: PermissionRepository,
      useClass: PrismaPermissionRepository,
    },
    CreatePermissionUseCase,
    GetPermissionByIdUseCase,
    ListPermissionsUseCase,
  ],
  controllers: [PermissionsController],
})
export class PermissionsModule {}
