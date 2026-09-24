import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { Organization, OrganizationRepository } from '../../domain';
import { OrganizationMapper } from './organization.mapper';

@Injectable()
export class PrismaOrganizationRepository implements OrganizationRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Organization[] | []> {
    const organizations = await this.prismaService.organization.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return OrganizationMapper.toDomainList(organizations);
  }

  async findById(id: string): Promise<Organization | null> {
    const organization = await this.prismaService.organization.findUnique({
      where: { id },
    });
    if (!organization) return null;
    return OrganizationMapper.toDomain(organization);
  }

  async findByName(name: string): Promise<Organization | null> {
    const organization = await this.prismaService.organization.findFirst({
      where: {
        name: {
          equals: name,
          mode: 'insensitive',
        },
      },
    });
    if (!organization) return null;
    return OrganizationMapper.toDomain(organization);
  }

  async create(organization: Organization): Promise<Organization> {
    const organizationCreated = await this.prismaService.organization.create({
      data: organization,
    });
    return OrganizationMapper.toDomain(organizationCreated);
  }

  async update(
    id: string,
    organization: Partial<Organization>,
  ): Promise<Organization> {
    const organizationUpdated = await this.prismaService.organization.update({
      where: { id },
      data: organization,
    });

    return OrganizationMapper.toDomain(organizationUpdated);
  }
}
