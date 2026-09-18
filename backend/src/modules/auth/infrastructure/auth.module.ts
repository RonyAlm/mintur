import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { jwtConstants } from '../constants';
import { UsersModule } from '../../../modules/users/infrastructure/users.module';
import { AuthController } from './controllers/auth.controller';
import { LoginUseCase, GetMyProfileUseCase } from '../applications';
import { RolesModule } from '../../../modules/roles/infrastructure/roles.module';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    RolesModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: { expiresIn: jwtConstants.expiresIn },
    }),
  ],
  controllers: [AuthController],
  providers: [LoginUseCase, GetMyProfileUseCase, JwtModule, JwtStrategy],
  exports: [JwtModule, LoginUseCase],
})
export class AuthModule {}
