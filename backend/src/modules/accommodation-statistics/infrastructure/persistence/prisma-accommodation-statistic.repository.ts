import { Injectable } from '@nestjs/common';
import {
  AccommodationDailyStatistic,
  AccommodationStatisticRepository,
} from '../../domain';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { AccommodationStatisticMapper } from './accommodation-statistic.mapper';

@Injectable()
export class PrismaAccommodationStatisticRepository implements AccommodationStatisticRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(
    statistic: AccommodationDailyStatistic,
  ): Promise<AccommodationDailyStatistic> {
    const result = await this.prismaService.$transaction(async (tx) => {
      const created = await tx.accommodationDailyStatistic.create({
        data: {
          id: statistic.id,
          accommodationId: statistic.accommodationId,
          date: statistic.date,
          totalGuests: statistic.totalGuests,

          ageRanges: {
            create: statistic.ageRanges.map((ageRange) => ({
              ageRange: ageRange.ageRange,
              quantity: ageRange.quantity,
            })),
          },

          travelPurposes: {
            create: statistic.travelPurposes.map((travelPurpose) => ({
              purpose: travelPurpose.purpose,
              quantity: travelPurpose.quantity,
            })),
          },

          origins: {
            create: statistic.origins.map((origin) => ({
              type: origin.type,
              name: origin.name,
              quantity: origin.quantity,
            })),
          },
        },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
      });

      return created;
    });

    return AccommodationStatisticMapper.toDomain(result);
  }

  async findById(id: string): Promise<AccommodationDailyStatistic | null> {
    const result =
      await this.prismaService.accommodationDailyStatistic.findUnique({
        where: { id },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
      });
    if (!result) return null;
    return AccommodationStatisticMapper.toDomain(result);
  }

  async findByAccommodationAndDate(
    accommodationId: string,
    date: Date,
  ): Promise<AccommodationDailyStatistic | null> {
    const result =
      await this.prismaService.accommodationDailyStatistic.findUnique({
        where: { accommodationId_date: { accommodationId, date } },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
      });
    if (!result) return null;
    return AccommodationStatisticMapper.toDomain(result);
  }

  async findByAccommodationId(
    accommodationId: string,
    from?: Date,
    to?: Date,
  ): Promise<AccommodationDailyStatistic[]> {
    const results =
      await this.prismaService.accommodationDailyStatistic.findMany({
        where: {
          accommodationId,
          ...(from || to
            ? {
                date: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
        orderBy: { date: 'asc' },
      });
    return AccommodationStatisticMapper.toDomainList(results);
  }

  async findAll(
    from?: Date,
    to?: Date,
  ): Promise<AccommodationDailyStatistic[]> {
    const results =
      await this.prismaService.accommodationDailyStatistic.findMany({
        where: {
          ...(from || to
            ? {
                date: {
                  ...(from ? { gte: from } : {}),
                  ...(to ? { lte: to } : {}),
                },
              }
            : {}),
        },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
        orderBy: { date: 'asc' },
      });
    return AccommodationStatisticMapper.toDomainList(results);
  }

  async update(
    statistic: AccommodationDailyStatistic,
  ): Promise<AccommodationDailyStatistic> {
    const result = await this.prismaService.$transaction(async (tx) => {
      await tx.accommodationStatisticAgeRange.deleteMany({
        where: {
          statisticId: statistic.id,
        },
      });

      await tx.accommodationStatisticTravelPurpose.deleteMany({
        where: {
          statisticId: statistic.id,
        },
      });

      await tx.accommodationStatisticOrigin.deleteMany({
        where: {
          statisticId: statistic.id,
        },
      });

      const created = await tx.accommodationDailyStatistic.update({
        where: { id: statistic.id },
        data: {
          date: statistic.date,
          totalGuests: statistic.totalGuests,

          ageRanges: {
            create: statistic.ageRanges.map((ageRange) => ({
              ageRange: ageRange.ageRange,
              quantity: ageRange.quantity,
            })),
          },

          travelPurposes: {
            create: statistic.travelPurposes.map((travelPurpose) => ({
              purpose: travelPurpose.purpose,
              quantity: travelPurpose.quantity,
            })),
          },

          origins: {
            create: statistic.origins.map((origin) => ({
              type: origin.type,
              name: origin.name,
              quantity: origin.quantity,
            })),
          },
        },
        include: {
          ageRanges: true,
          travelPurposes: true,
          origins: true,
        },
      });

      return created;
    });

    return AccommodationStatisticMapper.toDomain(result);
  }
}
