import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FindUserByEmailUseCase } from '../../../users/applications';
import { GetRoleByIdUseCase } from '../../../../modules/roles/application';
import { GetPermissionsByRoleIdUseCase } from '../../../../modules/permissions/applications';

@Injectable()
export class GetMyProfileUseCase {
  constructor(
    private readonly findUserByEmail: FindUserByEmailUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly getPermissionsByRoleIdUseCase: GetPermissionsByRoleIdUseCase,
  ) {}

  async execute(email: string) {
    if (!email) throw new UnauthorizedException('Invalid credentials');

    const user = await this.findUserByEmail.execute(email);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const role = await this.getRoleByIdUseCase.execute(user.roleId);
    if (!role) throw new UnauthorizedException('Invalid credentials');

    const permissions = await this.getPermissionsByRoleIdUseCase.execute(
      role.id,
    );

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
      permissions: permissions.length > 0 ? permissions.map((p) => p.name) : [],
    };
  }
}
