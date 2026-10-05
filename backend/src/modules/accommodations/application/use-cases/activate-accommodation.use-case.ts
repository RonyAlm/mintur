import { Injectable, NotFoundException } from '@nestjs/common';
import { Accommodation, AccommodationRepository } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface ActivateAccommodationInput {
  currentUser: { id: string; roleId: string };
  accommodationId: string;
}

@Injectable()
export class ActivateAccommodationUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: ActivateAccommodationInput): Promise<Accommodation> {
    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isAdminSystem) {
      await this.organizationAccessService.requireOrganizationAdmin(
        input.currentUser.roleId,
        input.currentUser.id,
        input.accommodationId,
      );
    }

    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );
    if (!accommodation) throw new NotFoundException('Alojamiento no existe');

    if (accommodation.isActive) return accommodation;

    const updatedAccommodation = await this.accommodationRepository.update(
      accommodation.id,
      {
        isActive: true,
        updatedAt: new Date(),
      },
    );

    return updatedAccommodation;
  }
}
