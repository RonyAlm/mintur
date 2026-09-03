import { Injectable, NotFoundException } from '@nestjs/common';
import { RoleRepository } from '../../domain';

@Injectable()
export class GetRoleByIdUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(id: string) {
    const role = await this.roleRepository.findById(id);
    if (!role) throw new NotFoundException('Role not found');
    return role;
  }
}
