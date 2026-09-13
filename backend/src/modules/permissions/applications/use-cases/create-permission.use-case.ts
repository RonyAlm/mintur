import { ConflictException, Injectable } from '@nestjs/common';
import { Permission, PermissionRepository } from '../../domain';
import { CreatePermissionDto } from '../dtos';

@Injectable()
export class CreatePermissionUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(dto: CreatePermissionDto): Promise<Permission> {
    const existingPermission = await this.permissionRepository.findByName(
      dto.name.trim(),
    );

    if (existingPermission)
      throw new ConflictException('Ya existe un permiso con ese nombre');

    const newPermission = {
      id: crypto.randomUUID(),
      name: dto.name.trim().toLocaleLowerCase(),
      description: dto.description?.trim(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Permission;

    const permissionCreated =
      await this.permissionRepository.save(newPermission);

    if (!permissionCreated)
      throw new ConflictException('No se pudo crear el permiso');

    return permissionCreated;
  }
}
