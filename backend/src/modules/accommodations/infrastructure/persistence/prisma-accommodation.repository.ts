import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { Accommodation, AccommodationRepository } from '../../domain';
import {
  AccommodationMapper,
  AccommodationTable,
} from './accomodation-mappers';

@Injectable()
export class PrismaAccommodationRepository implements AccommodationRepository {
  constructor(private prismaService: PrismaService) {}

  async create(accommodation: Accommodation): Promise<Accommodation> {
    const accommodationSaved = await this.prismaService.accommodation.create({
      data: AccommodationMapper.toPersistence(accommodation),
    });
    return AccommodationMapper.toDomain(accommodationSaved);
  }

  async findAll(): Promise<Accommodation[]> {
    const accommodations = await this.prismaService.accommodation.findMany({
      orderBy: { createdAt: 'desc' },
    });
    return AccommodationMapper.toDomainList(accommodations);
  }

  async findByOrganizationId(
    organizationId: string,
  ): Promise<Accommodation | null> {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { organizationId },
    });
    if (!accommodation) return null;
    return AccommodationMapper.toDomain(accommodation);
  }

  async findById(id: string): Promise<Accommodation | null> {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id },
    });
    if (!accommodation) return null;
    return AccommodationMapper.toDomain(accommodation);
  }

  async update(
    id: string,
    accommodation: Partial<Accommodation>,
  ): Promise<Accommodation> {
    const accommodationUpdated = await this.prismaService.accommodation.update({
      where: { id },
      data: accommodation as AccommodationTable,
    });

    return AccommodationMapper.toDomain(accommodationUpdated);
  }

  async delete(id: string): Promise<void> {
    await this.prismaService.accommodation.delete({ where: { id } });
  }
}
