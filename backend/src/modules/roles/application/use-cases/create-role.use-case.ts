import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, RoleRepository } from '../../domain';

export interface CreateRoleInput {
  name: string;
  description?: string;
}

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(input: CreateRoleInput): Promise<Role> {
    const existsRole = await this.roleRepository.findByName(input.name);
    if (existsRole)
      throw new NotFoundException('Ya existe un rol con ese nombre');

    const inputRole = {
      id: crypto.randomUUID(),
      name: input.name.trim().toLocaleUpperCase(),
      description: input.description?.trim(),
      isSystemRole: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Role;
    const role = await this.roleRepository.save(inputRole);
    return role;
  }
}
