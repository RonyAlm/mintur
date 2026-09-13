import { Injectable, NotFoundException } from '@nestjs/common';
import { PermissionRepository } from '../../domain';

@Injectable()
export class GetPermissionByIdUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute(id: string) {
    const permission = await this.permissionRepository.findById(id.trim());
    if (!permission) throw new NotFoundException('Permiso no encontrado');
    return permission;
  }
}
