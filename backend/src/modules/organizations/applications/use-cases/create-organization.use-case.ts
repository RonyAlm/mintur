import { ConflictException, Injectable } from '@nestjs/common';
import { OrganizationRepository, OrganizationType } from '../../domain';

type CreateOrganizationInput = {
  name: string;
  type: OrganizationType;
  description?: string;
};

@Injectable()
export class CreateOrganizationUseCase {
  constructor(
    private readonly organizationRepository: OrganizationRepository,
  ) {}

  async execute(input: CreateOrganizationInput) {
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
