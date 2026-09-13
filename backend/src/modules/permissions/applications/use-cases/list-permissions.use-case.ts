import { Injectable } from '@nestjs/common';
import { PermissionRepository } from '../../domain';

@Injectable()
export class ListPermissionsUseCase {
  constructor(private readonly permissionRepository: PermissionRepository) {}

  async execute() {
    return this.permissionRepository.findAll();
  }
}
