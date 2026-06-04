import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UsersModule } from '../../../modules/users/infrastructure/users.module';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase } from '../applications';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, JwtModule],
  exports: [JwtModule, LoginUseCase],
})
export class AuthModule {}
