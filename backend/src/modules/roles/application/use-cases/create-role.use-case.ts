import { Injectable, NotFoundException } from '@nestjs/common';
import { Role, RoleRepository } from '../../domain';
import { CreateRoleDto } from '../dtos';

@Injectable()
export class CreateRoleUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute(dto: CreateRoleDto): Promise<Role> {
    const existsRole = await this.roleRepository.findByName(dto.name);
    if (existsRole)
      throw new NotFoundException('Ya existe un rol con ese nombre');

    const inputRole = {
      id: crypto.randomUUID(),
      name: dto.name.trim(),
      description: dto.description?.trim().toLocaleUpperCase(),
      createdAt: new Date(),
      updatedAt: new Date(),
    } as Role;
    const role = await this.roleRepository.save(inputRole);
    return role;
  }
}
