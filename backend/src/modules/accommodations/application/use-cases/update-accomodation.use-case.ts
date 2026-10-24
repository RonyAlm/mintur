import { Injectable, NotFoundException } from '@nestjs/common';
import {
  Accommodation,
  AccommodationRepository,
  AccommodationType,
} from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface UpdateAccommodationInput {
  currentUser: { id: string; roleId: string };

  organization?: {
    name?: string;
    description?: string;
  };
  accommodationId: string;
  type?: AccommodationType;
  image?: string;
  address?: string;
  addressMap?: string;
  phoneOne?: string;
  phoneTwo?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
}

@Injectable()
export class UpdateAccommodationUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: UpdateAccommodationInput) {
    const existingAccommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );

    if (!existingAccommodation) {
      throw new NotFoundException('El alojamiento no existe');
    }
    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );

    if (!isAdminSystem) {
      await this.organizationAccessService.requireOrganizationAdmin(
        input.currentUser.roleId,
        input.currentUser.id,
        existingAccommodation.organizationId,
      );
    }

    const {
      currentUser: _currentUser,
      accommodationId: _accommodationId,
      organization,
      ...accommodationChanges
    } = input;

    const changes: Partial<
      Omit<Accommodation, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
    > = {};

    for (const [key, value] of Object.entries(accommodationChanges)) {
      if (value !== undefined) {
        Object.assign(changes, { [key]: value });
      }
    }

    return this.accommodationRepository.updateWithOrganization(
      input.accommodationId,
      {
        accommodation: changes,
        ...(organization ? { organization } : {}),
      },
    );
  }
}
