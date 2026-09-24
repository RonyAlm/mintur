import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { OrganizationRepository, OrganizationType } from '../../domain';

export type UpdateOrganizationInput = {
  name?: string;
  type?: OrganizationType;
  description?: string;
};

@Injectable()
export class UpdateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(id: string, input: UpdateOrganizationInput) {
    const existingOrganization = await this.organizationRepository.findById(
      id.trim(),
    );

    if (!existingOrganization) {
      throw new NotFoundException('Organización no encontrada');
    }

    if (input.name && existingOrganization.name !== input.name.trim()) {
      const organizationExists = await this.organizationRepository.findByName(
        input.name.trim(),
      );
      if (organizationExists) {
        throw new ConflictException(
          'Ya existe una organización con ese nombre',
        );
      }
    }

    const inputOrganization = {
      id: existingOrganization.id,
      name: input.name || existingOrganization.name,
      type: input.type || existingOrganization.type,
      description: input.description || existingOrganization.description,
      isActive: existingOrganization.isActive,
      createdAt: existingOrganization.createdAt,
      updatedAt: new Date(),
    };

    Object.assign(existingOrganization, inputOrganization);

    return this.organizationRepository.update(id, inputOrganization);
  }
}
