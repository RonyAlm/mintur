import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from '../../domain';

export interface UpdateRoleInput {
  name?: string;
  description?: string;
}

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string, input: UpdateRoleInput) {
    const role = await this.roleRepository.findById(id.trim());
    if (!role) throw new NotFoundException('No existe el rol');

    if (role.isSystemRole)
      throw new ForbiddenException('No se puede actualizar un rol del sistema');

    if (input.name && role.name !== input.name.trim()) {
      const roleExists = await this.roleRepository.findByName(
        input.name.trim(),
      );
      if (roleExists)
        throw new ConflictException({
          message: 'Ya existe un rol con ese nombre',
          statusCode: 409,
        });
    }

    const inputRole = {
      id: role.id,
      name: input.name && input.name.trim().toLocaleUpperCase(),
      description: input.description?.trim(),
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: new Date(),
    };

    Object.assign(role, inputRole);

    const updateRole = await this.roleRepository.update(role.id, role);
    if (!updateRole) throw new ConflictException('Error al actualizar el rol');

    return updateRole;
  }
}
