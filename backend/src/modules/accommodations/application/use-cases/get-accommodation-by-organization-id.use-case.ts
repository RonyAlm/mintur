import { Injectable, NotFoundException } from '@nestjs/common';
import { Accommodation, AccommodationRepository } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface GetAccommodationByOrganizationIdInput {
  currentUser: { id: string; roleId: string };
  organizationId: string;
}

@Injectable()
export class GetAccommodationByOrganizationIdUseCase {
  constructor(
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(
    input: GetAccommodationByOrganizationIdInput,
  ): Promise<Accommodation> {
    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isSystemAdmin) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        input.organizationId,
      );
    }

    const accommodation =
      await this.accommodationRepository.findByOrganizationId(
        input.organizationId,
      );
    if (!accommodation)
      throw new NotFoundException(
        'La organización no tiene alojamientos associados',
      );

    return accommodation;
  }
}
