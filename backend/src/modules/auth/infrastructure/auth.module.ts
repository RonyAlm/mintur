import 'dotenv/config';
import { JwtModule } from '@nestjs/jwt';
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategies';
import { LoginUseCase, GetMyProfileUseCase } from '../applications';
import { jwtConstants } from '../constants';
import { AuthController } from './controllers/auth.controller';
import { UsersModule } from '../../../modules/users/infrastructure/users.module';
import { RolesModule } from '../../../modules/roles/infrastructure/roles.module';
import { PermissionsModule } from '../../../modules/permissions/infrastructure/permissions.module';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
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
