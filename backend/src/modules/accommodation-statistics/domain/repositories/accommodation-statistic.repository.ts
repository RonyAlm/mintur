import { AccommodationDailyStatistic } from '../entities';

export abstract class AccommodationStatisticRepository {
  abstract create(
    statistic: AccommodationDailyStatistic,
  ): Promise<AccommodationDailyStatistic>;

  abstract findById(id: string): Promise<AccommodationDailyStatistic | null>;

  abstract findByAccommodationAndDate(
    accommodationId: string,
    date: Date,
  ): Promise<AccommodationDailyStatistic | null>;

  abstract findByAccommodationId(
    accommodationId: string,
    from?: Date,
    to?: Date,
  ): Promise<AccommodationDailyStatistic[]>;

  abstract findAll(
    from?: Date,
    to?: Date,
  ): Promise<AccommodationDailyStatistic[]>;

  abstract update(
    statistic: AccommodationDailyStatistic,
  ): Promise<AccommodationDailyStatistic>;
}
