import { Injectable, NotFoundException } from '@nestjs/common';
import { AccommodationStatisticRepository } from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';
import { AccommodationRepository } from 'src/modules/accommodations/domain';

export interface GetAccommodationDailyStatisticInput {
  currentUser: {
    id: string;
    roleId: string;
  };

  statisticId: string;
}

@Injectable()
export class GetAccommodationDailyStatisticUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetAccommodationDailyStatisticInput) {
    const statistic = await this.accommodationStatisticRepository.findById(
      input.statisticId,
    );

    if (!statistic) throw new NotFoundException('Estadística no encontrada');

    const accommodation = await this.accommodationRepository.findById(
      statistic.accommodationId,
    );
    if (!accommodation)
      throw new NotFoundException('Alojamiento no encontrado');

    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );

    if (!isAdminSystem) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        accommodation.organizationId,
      );
    }

    return statistic;
  }
}
