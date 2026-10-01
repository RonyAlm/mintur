import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { OrganizationRepository, OrganizationType } from '../../domain';
import { OrganizationAccessService } from '../services';

type CreateOrganizationInput = {
  currentUserRoleId: string;

  name: string;
  type: OrganizationType;
  description?: string;
};

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: CreateOrganizationInput) {
    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUserRoleId,
    );

    if (!isSystemAdmin) {
      throw new ForbiddenException(
        'No tienes permisos para crear una organización',
      );
    }

    const existingOrganization = await this.organizationRepository.findByName(
      input.name,
    );

    if (existingOrganization) {
      throw new ConflictException('La organización ya existe');
    }

    const newOrganization = {
      id: crypto.randomUUID(),
      name: input.name,
      type: input.type,
      description: input.description || '',
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    return await this.organizationRepository.create(newOrganization);
  }
}
