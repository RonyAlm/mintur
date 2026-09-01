import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
} from '@nestjs/common';
import { Request } from 'express';
// import { Auth } from './decorators';
// import { Role } from '../users/domain/entities';
// import { Activeuser } from '../../core/decorators/active-user.decotor';
import { LoginDto, LoginUseCase } from '../../applications';
// import { Auth } from '../../../core/decorators';
// import { Role } from '../../../../modules/users/domain';
import { Activeuser } from '../../../../core';
import {
  ChangePasswordDto,
  ChangePasswordUseCase,
} from 'src/modules/users/applications';
import { Auth } from 'src/core/decorators';
import { ProfileUseCase } from '../../applications/use-cases';
// import { Auth } from '../../../../core/decorators';

export interface RequestWithUser extends Request {
  user: {
    sub: string;
    email: string;
    role?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(
    private readonly loginUseCase: LoginUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly profileUseCase: ProfileUseCase,
  ) {}

  // @Post('register')
  // register(@Body() registerDto: RegisterDto) {
  //   return this.authService.register(registerDto);
  // }

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('profile')
  @Auth('USER')
  profile(@Activeuser() user: { email: string }) {
    return this.profileUseCase.execute(user.email);
  }

  @Patch('change-password')
  @Auth('USER')
  changePassword(
    @Body() dto: ChangePasswordDto,
    @Activeuser()
    user: {
      sub: string;
      email: string;
      role?: string;
    },
  ) {
    const userId = user.sub;
    return this.changePasswordUseCase.execute(userId, dto);
  }
}
