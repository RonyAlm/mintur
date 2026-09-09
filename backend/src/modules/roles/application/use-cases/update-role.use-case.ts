import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RoleRepository } from '../../domain';
import { UpdateRoleDto } from '../dtos';

@Injectable()
export class UpdateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string, dto: UpdateRoleDto) {
    const role = await this.roleRepository.findById(id.trim());
    if (!role) throw new NotFoundException('No existe el rol');

    if (role.isSystemRole)
      throw new ForbiddenException('No se puede actualizar un rol del sistema');

    if (dto.name && role.name !== dto.name.trim()) {
      const roleExists = await this.roleRepository.findByName(dto.name.trim());
      if (roleExists)
        throw new ConflictException({
          message: 'Ya existe un rol con ese nombre',
          statusCode: 409,
        });
    }

    const inputRole = {
      id: role.id,
      name: dto.name && dto.name.trim().toLocaleUpperCase(),
      description: dto.description?.trim(),
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
