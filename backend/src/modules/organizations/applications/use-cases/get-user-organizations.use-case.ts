import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationMembershipRepository } from '../../domain';
import { GetUserByIdUseCase } from '../../../../modules/users/applications';
import { OrganizationAccessService } from '../services';

export interface GetUserOrganizationsInput {
  currentUserRoleId: string;
  userId: string;
}

@Injectable()
export class GetUserOrganizationsUseCase {
  constructor(
    private readonly membershipRepository: OrganizationMembershipRepository,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetUserOrganizationsInput) {
    const user = await this.getUserByIdUseCase.execute(input.userId);
    if (!user) throw new NotFoundException('Usuario no encontrado');

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUserRoleId,
    );

    if (!isSystemAdmin)
      throw new ForbiddenException(
        'No tienes permisos para consultar esta información',
      );

    return this.membershipRepository.findByUserId(input.userId);
  }
}
