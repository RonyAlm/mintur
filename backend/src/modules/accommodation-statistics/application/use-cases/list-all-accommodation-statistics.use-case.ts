import { ConflictException, ForbiddenException, Injectable } from '@nestjs/common';
import {
  AccommodationDailyStatistic,
  AccommodationStatisticRepository,
} from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';

export interface ListAllAccommodationStatisticsInput {
  currentUser: { id: string; roleId: string };
  from?: Date;
  to?: Date;
}

@Injectable()
export class ListAllAccommodationStatisticsUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(
    input: ListAllAccommodationStatisticsInput,
  ): Promise<AccommodationDailyStatistic[]> {
    if (input.from && input.to && input.from > input.to)
      throw new ConflictException('La fecha de inicio es mayor que la de fin');

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );

    if (!isSystemAdmin)
      throw new ForbiddenException(
        'No tienes permisos para consultar las estadísticas globales',
      );

    return this.accommodationStatisticRepository.findAll(input.from, input.to);
  }
}
