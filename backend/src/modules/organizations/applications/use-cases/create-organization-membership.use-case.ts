import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationMembershipRepository,
  OrganizationRepository,
} from '../../domain';
import { OrganizationAccessService } from '../services';
import { GetUserByIdUseCase } from '../../../../modules/users/applications';

export interface CreateOrganizationMembershipInput {
  currentUser: { id: string; roleId: string };
  userId: string;
  organizationId: string;
  role: OrganizationMemberRole;
}

@Injectable()
export class CreateOrganizationMembershipUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly organizationRepository: OrganizationRepository,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: CreateOrganizationMembershipInput) {
    await this.organizationAccessService.requireOrganizationAdmin(
      input.currentUser.roleId,
      input.currentUser.id,
      input.organizationId,
    );

    const organization = await this.organizationRepository.findById(
      input.organizationId,
    );
    const user = await this.getUserByIdUseCase.execute(input.userId);
    if (!organization || !user) {
      throw new NotFoundException('Organización o usuario no encontrados');
    }

    if (organization.isActive === false) {
      throw new ConflictException('La organización está desactivada');
    }

    const existingMembership =
      await this.organizationMembershipRepository.findByUserAndOrganization(
        input.userId,
        input.organizationId,
      );
    if (existingMembership) {
      throw new ConflictException('El usuario ya está en la organización');
    }

    const inputMembership = {
      userId: input.userId,
      organizationId: input.organizationId,
      role: input.role,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.organizationMembershipRepository.create(inputMembership);
  }
}
