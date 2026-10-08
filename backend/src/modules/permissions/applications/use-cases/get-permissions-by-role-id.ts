import { Injectable } from '@nestjs/common';
import { RolePermissionRepository } from '../../domain';

@Injectable()
export class GetPermissionsByRoleIdUseCase {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async execute(roleId: string) {
    const permissions =
      await this.rolePermissionRepository.findPermissionsByRoleId(roleId);

    if (!permissions) return [];

    return permissions;
  }
}
