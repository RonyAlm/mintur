import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { Request } from 'express';
import {
  LoginDto,
  LoginUseCase,
  GetMyProfileUseCase,
} from '../../applications';
import {
  ChangePasswordDto,
  ChangePasswordUseCase,
} from '../../../../modules/users/applications';
import { JwtAuthGuard } from '../guards';
import { CurrentUser } from '../decorators';
import type { AuthenticatedUser } from '../../applications/types';

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
    private readonly getMyProfileUseCase: GetMyProfileUseCase,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Post('login')
  async login(@Body() dto: LoginDto) {
    return this.loginUseCase.execute(dto);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  profile(@CurrentUser() user: AuthenticatedUser) {
    return this.getMyProfileUseCase.execute(user.email);
  }

  @Patch('change-password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Body() dto: ChangePasswordDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.changePasswordUseCase.execute(user.id, dto);
  }
}
