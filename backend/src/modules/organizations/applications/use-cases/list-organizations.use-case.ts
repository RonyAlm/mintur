import { ForbiddenException, Injectable } from '@nestjs/common';
import { OrganizationRepository } from '../../domain';
import { OrganizationAccessService } from '../services';

@Injectable()
export class ListOrganizationsUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(currentUserRoleId: string) {
    const isSystemAdmin =
      await this.organizationAccessService.isSystemAdmin(currentUserRoleId);
    if (!isSystemAdmin)
      throw new ForbiddenException(
        'No tienes permisos para consultar esta información',
      );
    return await this.organizationRepository.findAll();
  }
}
