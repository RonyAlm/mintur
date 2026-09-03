import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { RoleRepository } from '../domain';
import {
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
} from '../application';
import { RolesController } from './controllers';
import { PrismaRoleRepository } from './persistence';

@Module({
  imports: [PrismaModule],
  exports: [],
  providers: [
    {
      provide: RoleRepository,
      useClass: PrismaRoleRepository,
    },
    CreateRoleUseCase,
    GetRoleByIdUseCase,
    ListRolesUseCase,
  ],
  controllers: [RolesController],
})
export class RolesModule {}

/* @Module({
  imports: [PrismaModule],
  exports: [FindUserByEmailUseCase, ChangePasswordUseCase],
  providers: [
    FindUserByEmailUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    CreateUserUseCase,
    ResetUserPasswordUseCase,
    ChangePasswordUseCase,
    UpdateUserUseCase,
    DeactivateUserUseCase,
    ActivateUserUseCase,
    GetUserByIdUseCase,
    ListUsersUseCase,
  ],
  controllers: [UsersController],
})
export class UsersModule {} */
