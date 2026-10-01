import { Injectable, NotFoundException } from '@nestjs/common';
import { RolePermissionRepository } from '../../../../modules/permissions/domain';
import { GetPermissionByIdUseCase } from '../../../../modules/permissions/applications';
import { GetRoleByIdUseCase } from './get-role-by-id.use-case';

export interface RemovePermissionFromRoleInput {
  roleId: string;
  permissionId: string;
}

@Injectable()
export class RemovePermissionFromRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
  ) {}

  async execute(input: RemovePermissionFromRoleInput) {
    const role = await this.getRoleByIdUseCase.execute(input.roleId.trim());
    const permission = await this.getPermissionByIdUseCase.execute(
      input.permissionId.trim(),
    );

    const exists = await this.rolePermissionRepository.exists(
      role.id,
      permission.id,
    );
    if (!exists)
      throw new NotFoundException('El permiso no está asignado al rol');

    await this.rolePermissionRepository.delete(role.id, permission.id);

    return { message: 'Permiso removido correctamente' };
  }
}
