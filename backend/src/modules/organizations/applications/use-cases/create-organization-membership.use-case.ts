import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  OrganizationMemberRole,
  OrganizationMembershipRepository,
} from '../../domain';
import { GetUserByIdUseCase } from '../../../../modules/users/applications';
import { GetOrganizationByIdUseCase } from './get-organization-by-id.use-case';

export interface CreateOrganizationMembershipInput {
  userId: string;
  organizationId: string;
  role: OrganizationMemberRole;
}

@Injectable()
export class CreateOrganizationMembershipUseCase {
  constructor(
    private readonly organizationMembershipRepository: OrganizationMembershipRepository,
    private readonly getOrganizationByIdUseCase: GetOrganizationByIdUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
  ) {}

  async execute(input: CreateOrganizationMembershipInput) {
    const organization = await this.getOrganizationByIdUseCase.execute(
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
