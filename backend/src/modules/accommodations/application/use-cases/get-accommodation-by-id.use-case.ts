import { Injectable, NotFoundException } from '@nestjs/common';
import { Accommodation, AccommodationRepository } from '../../domain';
import { OrganizationAccessService } from 'src/modules/organizations/applications';

export interface GetAccommodationByIdInput {
  currentUser: { id: string; roleId: string };
  accommodationId: string;
}

@Injectable()
export class GetAccommodationByIdUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetAccommodationByIdInput): Promise<Accommodation> {
    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );
    if (!accommodation) throw new NotFoundException('Alojamiento no existe');

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isSystemAdmin) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        accommodation.organizationId,
      );
    }

    return accommodation;
  }
}
