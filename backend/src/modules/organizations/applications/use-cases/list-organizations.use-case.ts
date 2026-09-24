import { Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../domain';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute() {
    return await this.organizationRepository.findAll();
  }
}
