import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { CreateUserUseCase, FindUserByEmailUseCase } from '../applications';
import { PrismaUsersRepository } from './persistence';
import { UsersRepository } from '../domain';
import { UsersController } from './controllers';

@Module({
  imports: [PrismaModule],
  exports: [FindUserByEmailUseCase],
  providers: [
    FindUserByEmailUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
    CreateUserUseCase,
  ],
  controllers: [UsersController],
})
export class UsersModule {}

//  controllers: [AuthController],
//   providers: [LoginUseCase, JwtModule],
//   exports: [JwtModule, LoginUseCase],
