import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../../users/applications';

@Injectable()
export class GetMyProfileUseCase {
  constructor(private readonly findUserByEmail: FindUserByEmailUseCase) {}

  async execute(email: string) {
    if (!email) throw new UnauthorizedException('Invalid credentials');

    const user = await this.findUserByEmail.execute(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.roleId,
    };
  }
}
