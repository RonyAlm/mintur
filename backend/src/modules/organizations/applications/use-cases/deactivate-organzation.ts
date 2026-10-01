import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository } from '../../domain';
import { OrganizationAccessService } from '../services';

@Injectable()
export class DeactivateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(organizationId: string, currentUserRoleId: string) {
    const organization =
      await this.organizationRepository.findById(organizationId);
    if (!organization)
      throw new NotFoundException('Organización no encontrada');

    const isSystemAdmin =
      await this.organizationAccessService.isSystemAdmin(currentUserRoleId);
    if (!isSystemAdmin)
      throw new ForbiddenException(
        'No tienes permisos para desactivar esta organización',
      );

    if (!organization.isActive) return organization;

    const organizationUpdated = await this.organizationRepository.update(
      organizationId,
      {
        isActive: false,
      },
    );

    return organizationUpdated;
  }
}
