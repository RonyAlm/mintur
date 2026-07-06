import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { Request } from 'express';
// import { Auth } from './decorators';
// import { Role } from '../users/domain/entities';
// import { Activeuser } from '../../core/decorators/active-user.decotor';
import { LoginDto, LoginUseCase } from '../../applications';
// import { Auth } from '../../../core/decorators';
import { Role } from '../../../../modules/users/domain';
import { Activeuser } from '../../../../core';
import { Auth } from '../../../../core/decorators';

export interface RequestWithUser extends Request {
  user: {
    email: string;
    role?: string;
  };
}

@Controller('auth')
export class AuthController {
  constructor(private readonly loginUseCase: LoginUseCase) {}

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
  @Auth(Role.ADMIN)
  profile(@Activeuser() user: { email: string }) {
    console.log(user);
    return user;
  }
}
