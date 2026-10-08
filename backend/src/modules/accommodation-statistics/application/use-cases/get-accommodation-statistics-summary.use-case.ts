import { Injectable } from '@nestjs/common';
import {
  AccommodationDailyStatistic,
  AccommodationStatisticAgeRange,
  AccommodationStatisticOrigin,
  AccommodationStatisticRepository,
  AccommodationStatisticTravelPurpose,
} from '../../domain';
import { OrganizationAccessService } from '../../../../modules/organizations/applications';
import { AccommodationRepository } from '../../../../modules/accommodations/domain';

export interface GetAccommodationStatisticsSummaryInput {
  currentUser: { id: string; roleId: string };

  accommodationId: string;

  from: Date;
  to: Date;
}

@Injectable()
export class GetAccommodationStatisticsSummaryUseCase {
  constructor(
    private readonly accommodationStatisticRepository: AccommodationStatisticRepository,
    private readonly accommodationRepository: AccommodationRepository,
    private readonly organizationAccessService: OrganizationAccessService,
  ) {}

  async execute(input: GetAccommodationStatisticsSummaryInput) {
    const accommodation = await this.accommodationRepository.findById(
      input.accommodationId,
    );
    if (!accommodation) throw new Error('El alojamiento no existe');

    const isSystemAdmin = await this.organizationAccessService.isSystemAdmin(
      input.currentUser.roleId,
    );
    if (!isSystemAdmin) {
      await this.organizationAccessService.getMembership(
        input.currentUser.id,
        accommodation.organizationId,
      );
    }

    const statistics =
      await this.accommodationStatisticRepository.findByAccommodationId(
        input.accommodationId,
        input.from,
        input.to,
      );

    return {
      from: input.from,
      to: input.to,

      totalGuests: statistics.reduce((acc, stat) => acc + stat.totalGuests, 0),

      ageRages: this.aggregateAgeRanges(statistics),
      travelPurposes: this.aggregateTravelPurposes(statistics),
      origins: this.aggregateOrigins(statistics),
    };
  }

  private aggregateAgeRanges(statistics: AccommodationDailyStatistic[]) {
    const ageRanges: AccommodationStatisticAgeRange[] = [];

    statistics.forEach((stat) => {
      stat.ageRanges.forEach((ageRange) => {
        const existingRange = ageRanges.find(
          (r) => r.ageRange === ageRange.ageRange,
        );
        if (existingRange) {
          existingRange.quantity += ageRange.quantity;
        } else {
          ageRanges.push({
            statisticId: stat.id,
            ageRange: ageRange.ageRange,
            quantity: ageRange.quantity,
          });
        }
      });
    });

    return ageRanges;
  }

  private aggregateOrigins(statistics: AccommodationDailyStatistic[]) {
    const origins: AccommodationStatisticOrigin[] = [];

    statistics.forEach((stat) => {
      stat.origins.forEach((origin) => {
        const existingOrigin = origins.find((o) => o.name === origin.name);
        if (existingOrigin) {
          existingOrigin.quantity += origin.quantity;
        } else {
          origins.push({
            statisticId: stat.id,
            type: origin.type,
            name: origin.name,
            quantity: origin.quantity,
          });
        }
      });
    });

    return origins;
  }

  private aggregateTravelPurposes(statistics: AccommodationDailyStatistic[]) {
    const travelPurposes: AccommodationStatisticTravelPurpose[] = [];

    statistics.forEach((stat) => {
      stat.travelPurposes.forEach((travelPurpose) => {
        const existingTravelPurpose = travelPurposes.find(
          (tp) => tp.purpose === travelPurpose.purpose,
        );
        if (existingTravelPurpose) {
          existingTravelPurpose.quantity += travelPurpose.quantity;
        } else {
          travelPurposes.push({
            statisticId: stat.id,
            purpose: travelPurpose.purpose,
            quantity: travelPurpose.quantity,
          });
        }
      });
    });

    return travelPurposes;
  }
}
