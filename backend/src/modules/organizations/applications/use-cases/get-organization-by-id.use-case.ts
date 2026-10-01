import { Injectable, NotFoundException } from '@nestjs/common';
import { OrganizationRepository } from '../../domain';
import { OrganizationAccessService } from '../services';

export interface GetOrganizationByIdInput {
  currentUser: { id: string; roleId: string };

  organizationId: string;
}

@Injectable()
export class GetOrganizationByIdUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetOrganizationByIdInput) {
    const organization = await this.organizationRepository.findById(
      input.organizationId.trim(),
    );
    if (!organization)
      throw new NotFoundException('Organización no encontrada');

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isSystemAdmin) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        input.organizationId,
      );
    }

    return organization;
  }
}
