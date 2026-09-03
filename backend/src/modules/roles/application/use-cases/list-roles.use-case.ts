import { Injectable } from '@nestjs/common';
import { RoleRepository } from '../../domain';

@Injectable()
export class ListRolesUseCase {
  constructor(private readonly roleRepository: RoleRepository) {}

  async execute() {
    return this.roleRepository.findAll();
  }
}
