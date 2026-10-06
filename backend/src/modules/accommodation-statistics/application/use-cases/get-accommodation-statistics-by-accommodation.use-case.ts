import { BadRequestException, Injectable } from '@nestjs/common';
import { AccommodationStatisticRepository } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';
import { AccommodationRepository } from '../../../../modules/accommodations/domain';

export interface GetAccommodationStatisticsByAccommodationInput {
  currentUser: { id: string; roleId: string };
  accommodationId: string;

  from?: Date;
  to?: Date;
}

@Injectable()
export class GetAccommodationStatisticsByAccommodationUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetAccommodationStatisticsByAccommodationInput) {
    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );
    if (!accommodation) {
      throw new Error('El alojamiento no existe');
    }

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isSystemAdmin) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        accommodation.organizationId,
      );
    }

    this.validateDateRange(input.from, input.to);

    return this.accommodationStatisticRepository.findByAccommodationId(
      input.accommodationId,
      input.from,
      input.to,
    );
  }

  private validateDateRange(from?: Date, to?: Date) {
    if (!from && !to) return;

    if (!!from && !!to && from > to) {
      throw new BadRequestException(
        'La fecha desde debe ser menor a la fecha hasta',
      );
    }
  }
}
