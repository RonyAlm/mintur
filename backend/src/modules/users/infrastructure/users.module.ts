import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import {
  ActivateUserUseCase,
  ChangePasswordUseCase,
  CreateUserUseCase,
  DeactivateUserUseCase,
  FindUserByEmailUseCase,
  GetUserByIdUseCase,
  ListUsersUseCase,
  ResetUserPasswordUseCase,
  UpdateUserUseCase,
} from '../applications';
import { PrismaUsersRepository } from './persistence';
import { UsersRepository } from '../domain';
// import { roleRepository } from '../../../modules/roles/domain';
import { UsersController } from './controllers';
import { RolesModule } from '../../../modules/roles/infrastructure/roles.module';
import { PermissionsModule } from 'src/modules/permissions/infrastructure/permissions.module';

@Module({
  imports: [PrismaModule, RolesModule, PermissionsModule],
  exports: [FindUserByEmailUseCase, ChangePasswordUseCase, GetUserByIdUseCase],
  providers: [
    {
      provide: UsersRepository,
      // roleRepository,
      useClass: PrismaUsersRepository,
    },
    FindUserByEmailUseCase,
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
export class UsersModule {}
