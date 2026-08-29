import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../../../modules/users/applications';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto';
import bcrypt from 'bcryptjs';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly jwtService: JwtService,
  ) {}

  async execute(dto: LoginDto) {
    const user = await this.findUserByEmail.execute(dto.email);

    if (!user) throw new UnauthorizedException('Invalid credentials');

    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');
    const payload = {
      sub: user.id,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
