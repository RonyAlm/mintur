import {
  ConflictException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import {
  AccommodationAgeRange,
  AccommodationDailyStatistic,
  AccommodationOriginType,
  AccommodationStatisticRepository,
  AccommodationTravelPurpose,
} from '../../domain';
import { OrganizationAccessService } from 'src/modules/organizations/applications';

export interface GetAllAccommodationsStatisticsSummaryInput {
  currentUser: { id: string; roleId: string };
  from: Date;
  to: Date;
}

export interface GetAllAccommodationsStatisticsSummary {
  from: Date;
  to: Date;
  totalGuests: number;
  totalRecords: number;
  accomodationsCount: number;
  ageRanges: {
    ageRange: AccommodationAgeRange;
    quantity: number;
  }[];
  travelPurposes: {
    purpose: AccommodationTravelPurpose;
    quantity: number;
  }[];
  origins: {
    type: AccommodationOriginType;
    name: string;
    quantity: number;
  }[];
}

@Injectable()
export class GetAllAccommodationsStatisticsSummaryUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetAllAccommodationsStatisticsSummaryInput) {
    if (input.from > input.to)
      throw new ConflictException('La fecha de inicio es mayor que la de fin');

    const isAdminSystem = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );

    if (!isAdminSystem)
      throw new ForbiddenException(
        'No tienes permisos para consultar las estadísticas globales',
      );

    const statistics = await this.accommodationStatisticRepository.findAll(
      input.from,
      input.to,
    );

    return {
      from: input.from,
      to: input.to,
      totalGuests: statistics.reduce((acc, stat) => acc + stat.totalGuests, 0),
      totalRecords: statistics.length,
      accomodationsCount: new Set(
        statistics.map((stat) => stat.accommodationId),
      ).size,
      ageRanges: this.aggregateAgeRanges(statistics),
      travelPurposes: this.aggregateTravelPurposes(statistics),
      origins: this.aggregateOrigins(statistics),
    };
  }

  private aggregateAgeRanges(statistics: AccommodationDailyStatistic[]) {
    const quantities = new Map<AccommodationAgeRange, number>();

    for (const stat of statistics) {
      for (const ageRange of stat.ageRanges) {
        const quantity = quantities.get(ageRange.ageRange) || 0;
        quantities.set(ageRange.ageRange, quantity + ageRange.quantity);
      }
    }

    return Array.from(quantities.entries()).map(([ageRange, quantity]) => ({
      ageRange,
      quantity,
    }));
  }

  private aggregateTravelPurposes(statistics: AccommodationDailyStatistic[]) {
    const quantities = new Map<AccommodationTravelPurpose, number>();

    for (const stat of statistics) {
      for (const travelPurpose of stat.travelPurposes) {
        const quantity = quantities.get(travelPurpose.purpose) || 0;
        quantities.set(
          travelPurpose.purpose,
          quantity + travelPurpose.quantity,
        );
      }
    }

    return Array.from(quantities.entries()).map(
      ([travelPurpose, quantity]) => ({
        purpose: travelPurpose,
        quantity,
      }),
    );
  }

  private aggregateOrigins(statistics: AccommodationDailyStatistic[]) {
    const quantities = new Map<AccommodationOriginType, number>();

    for (const stat of statistics) {
      for (const origin of stat.origins) {
        const quantity = quantities.get(origin.type) || 0;
        quantities.set(origin.type, quantity + origin.quantity);
      }
    }

    return Array.from(quantities.entries()).map(([type, quantity]) => ({
      type,
      quantity,
    }));
  }
}
