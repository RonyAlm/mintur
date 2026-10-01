import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationMembershipRepository } from '../../domain';
import { OrganizationAccessService } from '../services';

@Injectable()
export class RemoveOrganizationMembershipUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(
    currentUser: {
      id: string;
      roleId: string;
    },
    userId: string,
    organizationId: string,
  ) {
    await this.organizationAccessService.requireOrganizationAdmin(
      currentUser.roleId,
      currentUser.id,
      organizationId,
    );

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
