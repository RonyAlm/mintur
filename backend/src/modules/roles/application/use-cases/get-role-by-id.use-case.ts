import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain';
import { GetPermissionsByRoleIdUseCase } from 'src/modules/permissions/applications';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(
    private readonly roleRepository: RoleRepository,
    private readonly getPermissionsByRoleIdUseCase: GetPermissionsByRoleIdUseCase,
  ) {}

  async execute(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('No existe el rol');

    const permissions = await this.getPermissionsByRoleIdUseCase.execute(
      role.id,
    );

    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: permissions.length > 0 ? permissions.map((p) => p.name) : [],
    };
  }
}
