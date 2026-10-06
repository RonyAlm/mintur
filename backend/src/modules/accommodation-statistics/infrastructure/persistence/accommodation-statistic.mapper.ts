import { AccommodationDailyStatistic as AccommodationDailyStatisticEntity } from '../../domain/entities';
import {
  AccommodationDailyStatistic,
  AccommodationStatisticOrigin,
  AccommodationStatisticAgeRange,
  AccommodationStatisticTravelPurpose,
} from '../../../../core/lib/generated/prisma/client';

export interface AccommodationDailyStatisticTable extends AccommodationDailyStatistic {
  id: string;
  accommodationId: string;
  date: Date;
  totalGuests: number;
  ageRanges: AccommodationStatisticAgeRange[];
  travelPurposes: AccommodationStatisticTravelPurpose[];
  origins: AccommodationStatisticOrigin[];

  createdAt: Date;
  updatedAt: Date;
}

export class AccommodationStatisticMapper {
  static toDomain(
    raw: AccommodationDailyStatisticTable,
  ): AccommodationDailyStatisticEntity {
    return {
      id: raw.id,
      accommodationId: raw.accommodationId,
      date: raw.date,
      totalGuests: raw.totalGuests,
      ageRanges: raw.ageRanges,
      travelPurposes: raw.travelPurposes,
      origins: raw.origins,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(
    raw: AccommodationDailyStatisticTable[],
  ): AccommodationDailyStatisticEntity[] {
    return raw.map((statistic) => this.toDomain(statistic));
  }
}
