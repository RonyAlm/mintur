import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationMembershipRepository } from '../../domain';

@Injectable()
export class RemoveOrganizationMembershipUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
  ) {}

  async execute(userId: string, organizationId: string) {
    const membership =
      await this.organizationMembershipRepository.findByUserAndOrganization(
        userId,
        organizationId,
      );

    if (!membership)
      throw new NotFoundException('Membresia de la organización no encontrada');

    return this.organizationMembershipRepository.delete(userId, organizationId);
  }
}
