import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationMembershipRepository,
} from '../../domain';
import { OrganizationAccessService } from '../services';

export interface UpdateOrganizationMembershipInput {
  currentUser: { id: string; roleId: string };
  userId: string;
  organizationId: string;
  role: OrganizationMemberRole;
}

@Injectable()
export class UpdateOrganizationMembershipUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: UpdateOrganizationMembershipInput) {
    await this.organizationAccessService.requireOrganizationAdmin(
      input.currentUser.roleId,
      input.currentUser.id,
      input.organizationId,
    );
    const membership =
      await this.organizationMembershipRepository.findByUserAndOrganization(
        input.userId,
        input.organizationId,
      );

    if (!membership)
      throw new NotFoundException('Membresia de la organización no encontrada');

    const inputMembership = {
      userId: membership.userId,
      organizationId: membership.organizationId,
      role: input.role,
      createdAt: membership.createdAt,
      updatedAt: new Date(),
    };

    Object.assign(membership, inputMembership);

    return this.organizationMembershipRepository.update(inputMembership);
  }
}
