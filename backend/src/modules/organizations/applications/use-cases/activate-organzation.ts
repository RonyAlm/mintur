import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../domain';

@Injectable()
export class ActivateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string) {
    const organization = await this.organizationRepository.findById(id.trim());
    if (!organization)
      throw new NotFoundException('Organización no encontrada');

    if (organization.isActive) return organization;

    const organizationUpdated = await this.organizationRepository.update(id, {
      isActive: true,
    });

    return organizationUpdated;
  }
}
