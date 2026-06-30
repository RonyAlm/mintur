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

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid)
      throw new UnauthorizedException('Invalid credentials');
    const payload = { id: user.id, email: user.email, role: user.role };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      email: user.email,
    };
  }
}
