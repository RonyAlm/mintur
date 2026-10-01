import { Injectable, NotFoundException } from '@nestjs/common';
import {
  OrganizationMembershipRepository,
  OrganizationRepository,
} from '../../domain';
import { OrganizationAccessService } from '../services';

export interface GetOrganizationMembershipsInput {
  currentUser: { id: string; roleId: string };
  organizationId: string;
}

@Injectable()
export class GetOrganizationMembershipsUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}
  async execute(input: GetOrganizationMembershipsInput) {
    const organization = await this.organizationRepository.findById(
      input.organizationId,
    );

    if (!organization) {
      throw new NotFoundException('Organización no encontrada');
    }

    await this.organizationAccessService.requireOrganizationAdmin(
      input.currentUser.roleId,
      input.currentUser.id,
      input.organizationId,
    );

    return this.organizationMembershipRepository.findByOrganizationId(
      input.organizationId,
    );
  }
}
