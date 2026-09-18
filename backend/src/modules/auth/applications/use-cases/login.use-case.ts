import bcrypt from 'bcryptjs';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto';
import { FindUserByEmailUseCase } from '../../../../modules/users/applications';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findUserByEmail: FindUserByEmailUseCase,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.findUserByEmail.execute(dto.email);

    if (!user || !user.isActive)
      throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: user.id,
      email: user.email,
      roleId: user.roleId,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
