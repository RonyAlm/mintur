import { Module } from '@nestjs/common';
import { PrismaModule } from '../../../modules/prisma/prisma.module';
import { FindUserByEmailUseCase } from '../applications';
import { PrismaUsersRepository } from './persistence';
import { UsersRepository } from '../domain';

@Module({
  imports: [PrismaModule],
  exports: [FindUserByEmailUseCase],
  providers: [
    FindUserByEmailUseCase,
    {
      provide: UsersRepository,
      useClass: PrismaUsersRepository,
    },
  ],
})
export class UsersModule {}
