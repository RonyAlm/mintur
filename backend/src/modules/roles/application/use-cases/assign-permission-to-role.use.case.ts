import { ConflictException, Injectable } from '@nestjs/common';
import { GetPermissionByIdUseCase } from '../../../../modules/permissions/applications';
import { RolePermissionRepository } from '../../../../modules/permissions/domain';
import { GetRoleByIdUseCase } from './get-role-by-id.use-case';
import { AssignPermissionToRoleDto } from '../dtos';

@Injectable()
export class AssignPermissionToRoleUseCase {
  constructor(
    private readonly rolePermissionRepository: RolePermissionRepository,
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  async execute(dto: AssignPermissionToRoleDto) {
    const role = await this.getRoleByIdUseCase.execute(dto.roleId.trim());

    const permission = await this.getPermissionByIdUseCase.execute(
      dto.permissionId.trim(),
    );

    const exists = await this.rolePermissionRepository.exists(
      role.id,
      permission.id,
    );
    if (exists) throw new ConflictException('Permiso ya asignado');

    const result = await this.rolePermissionRepository.create(
      role.id,
      permission.id,
    );

    return result && { message: 'Permiso asignado correctamente' };
  }
}
