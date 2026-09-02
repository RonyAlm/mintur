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
import { UsersController } from './controllers';

@Module({
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
export class UsersModule {}

//  controllers: [AuthController],
//   providers: [LoginUseCase, JwtModule],
//   exports: [JwtModule, LoginUseCase],
