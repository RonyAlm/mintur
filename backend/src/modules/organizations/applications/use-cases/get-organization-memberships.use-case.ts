import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrganizationMembershipRepository,
  OrganizationRepository,
} from '../../domain';

@Injectable()
export class GetOrganizationMembershipsUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
  ) {}
  async execute(organizationId: string) {
    const organization =
      await this.organizationRepository.findById(organizationId);

    if (!organization) {
      throw new NotFoundException('Organización no encontrada');
    }

    return this.organizationMembershipRepository.findByOrganizationId(
      organizationId,
    );
  }
}
