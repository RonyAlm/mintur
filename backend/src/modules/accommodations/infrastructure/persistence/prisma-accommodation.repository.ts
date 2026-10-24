import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import {
  Accommodation,
  AccommodationRepository,
  AccommodationWithOrganization,
} from '../../domain';
import {
  AccommodationMapper,
  AccommodationTable,
} from './accomodation-mappers';
import { OrganizationType } from 'src/modules/organizations/domain';

@Injectable()
export class PrismaAccommodationRepository implements AccommodationRepository {
  constructor(private prismaService: PrismaService) {}

  async create(accommodation: Accommodation): Promise<Accommodation> {
    const accommodationSaved = await this.prismaService.accommodation.create({
      data: AccommodationMapper.toPersistence(accommodation),
    });
    return AccommodationMapper.toDomain(accommodationSaved);
  }

  async findAll(): Promise<AccommodationWithOrganization[]> {
    const accommodations = await this.prismaService.accommodation.findMany({
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return AccommodationMapper.toDomainListWithOrganization(accommodations);
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

  async findByOrganizationIds(
    organizationIds: string[],
  ): Promise<AccommodationWithOrganization[]> {
    if (organizationIds.length === 0) return [];
    const accommodations = await this.prismaService.accommodation.findMany({
      where: { organizationId: { in: organizationIds } },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return AccommodationMapper.toDomainListWithOrganization(accommodations);
  }

  async findById(id: string): Promise<AccommodationWithOrganization | null> {
    const accommodation = await this.prismaService.accommodation.findUnique({
      where: { id },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    if (!accommodation) return null;
    return AccommodationMapper.toDomainWithOrganization(accommodation);
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

  async createWithOrganization(input: {
    organization: {
      name: string;
      description?: string;
    };
    accommodation: Omit<
      Accommodation,
      'id' | 'organizationId' | 'createdAt' | 'updatedAt'
    >;
  }): Promise<AccommodationWithOrganization> {
    const accommodation = await this.prismaService.accommodation.create({
      data: {
        ...input.accommodation,
        organization: {
          create: {
            name: input.organization.name,
            description: input.organization.description,
            type: OrganizationType.ACCOMMODATION,
          },
        },
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return AccommodationMapper.toDomainWithOrganization(accommodation);
  }

  async updateWithOrganization(
    id: string,
    input: {
      accommodation: Partial<
        Omit<Accommodation, 'id' | 'organizationId' | 'createdAt' | 'updatedAt'>
      >;
      organization?: {
        name?: string;
        description?: string | null;
      };
    },
  ): Promise<AccommodationWithOrganization> {
    const { accommodation, organization } = input;
    const accommodationUpdated = await this.prismaService.accommodation.update({
      where: { id },
      data: {
        ...accommodation,
        ...(organization
          ? {
              organization: {
                update: organization,
              },
            }
          : {}),
      },
      include: {
        organization: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
      },
    });
    return AccommodationMapper.toDomainWithOrganization(accommodationUpdated);
  }
}
