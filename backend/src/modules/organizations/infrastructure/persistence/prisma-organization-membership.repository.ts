import { Injectable } from '@nestjs/common';
import {
  OrganizationMembership,
  OrganizationMembershipRepository,
} from '../../domain';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { OrganizationMembershipMapper } from './organization-membership.mapper';

@Injectable()
export class PrismaOrganizationMembershipRepository implements OrganizationMembershipRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async create(
    membership: OrganizationMembership,
  ): Promise<OrganizationMembership> {
    const membershipCreated =
      await this.prismaService.organizationMembership.create({
        data: membership,
      });

    return OrganizationMembershipMapper.toDomain(membershipCreated);
  }
  async findByUserAndOrganization(
    userId: string,
    organizationId: string,
  ): Promise<OrganizationMembership | null> {
    const membership =
      await this.prismaService.organizationMembership.findUnique({
        where: {
          userId_organizationId: {
            userId,
            organizationId,
          },
        },
      });

    if (!membership) return null;

    return OrganizationMembershipMapper.toDomain(membership);
  }
  async findByOrganizationId(
    organizationId: string,
  ): Promise<OrganizationMembership[] | []> {
    const memberships =
      await this.prismaService.organizationMembership.findMany({
        where: {
          organizationId,
        },
        orderBy: { createdAt: 'asc' },
      });

    if (!memberships) return [];

    return OrganizationMembershipMapper.toDomainList(memberships);
  }

  async findByUserId(userId: string): Promise<OrganizationMembership[] | []> {
    const memberships =
      await this.prismaService.organizationMembership.findMany({
        where: { userId },
        orderBy: { createdAt: 'asc' },
      });
    if (!memberships) return [];

    return OrganizationMembershipMapper.toDomainList(memberships);
  }

  async update(
    membership: OrganizationMembership,
  ): Promise<OrganizationMembership> {
    const membershipUpdated =
      await this.prismaService.organizationMembership.update({
        where: {
          userId_organizationId: {
            userId: membership.userId,
            organizationId: membership.organizationId,
          },
        },
        data: membership,
      });

    return OrganizationMembershipMapper.toDomain(membershipUpdated);
  }
  async delete(userId: string, organizationId: string): Promise<void> {
    await this.prismaService.organizationMembership.delete({
      where: {
        userId_organizationId: {
          userId,
          organizationId,
        },
      },
    });
  }
}
