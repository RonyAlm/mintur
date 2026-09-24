import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../domain';

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string) {
    const organization = await this.organizationRepository.findById(id.trim());
    if (!organization)
      throw new NotFoundException('Organización no encontrada');

    return organization;
  }
}
