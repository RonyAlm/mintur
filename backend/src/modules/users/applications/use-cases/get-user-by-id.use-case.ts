import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSecured, UsersRepository } from '../../domain';
import { Role } from '../../../../modules/roles/domain';
import { GetRoleByIdUseCase } from '../../../../modules/roles/application';

export interface ResponseGetUserById extends Omit<UserSecured, 'roleId'> {
  role: Partial<Role>;
}

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  async execute(id: string): Promise<ResponseGetUserById | null> {
    id = id.trim();
    if (!id) throw new NotFoundException('No se proporcionó el id del usuario');
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('No se encontró el usuario');

    const role = await this.getRoleByIdUseCase.execute(user.roleId.trim());
    if (!role) throw new NotFoundException('No se encontró el rol del usuario');

    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
      role: {
        id: role.id,
        name: role.name,
        description: role.description,
      },
    } as ResponseGetUserById;
  }
}
