import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcryptjs';
import { FindUserByEmailUseCase } from '../../../../modules/users/applications';
import { GetRoleByIdUseCase } from '../../../../modules/roles/application';
import { LoginDto } from '../dto';

@Injectable()
export class LoginUseCase {
  constructor(
    private readonly jwtService: JwtService,
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
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

    const role = await this.getRoleByIdUseCase.execute(user.roleId);

    const payload = {
      sub: user.id,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      role: role.name,
    };
    return {
      accessToken: await this.jwtService.signAsync(payload),
      email: user.email,
      mustChangePassword: user.mustChangePassword,
    };
  }
}
