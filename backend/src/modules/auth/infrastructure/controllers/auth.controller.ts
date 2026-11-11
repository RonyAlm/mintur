import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Request,
  Res,
  UseGuards,
} from '@nestjs/common';

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
import type { Response } from 'express';

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
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const { accessToken, ...result } = await this.loginUseCase.execute(dto);

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
      maxAge: 10000 * 60 * 60 * 24, // 1 day
    });

    return result;
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('accessToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      path: '/',
    });

    return { message: 'Session closed successfully' };
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
