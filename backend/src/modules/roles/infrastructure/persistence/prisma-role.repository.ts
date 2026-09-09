import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { Role, RoleRepository } from '../../domain';
import { RoleMapper } from './role.mapper';

@Injectable()
export class PrismaRoleRepository implements RoleRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Role[] | []> {
    const roles = await this.prismaService.role.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return RoleMapper.toDomainList(roles);
  }

  async findByName(name: string): Promise<Role | null> {
    return await this.prismaService.role.findUnique({ where: { name } });
  }

  async findById(id: string): Promise<Role | null> {
    return this.prismaService.role.findUnique({ where: { id } });
  }

  async save(role: Role): Promise<Role> {
    return this.prismaService.role.create({ data: role });
  }

  async update(id: string, role: Partial<Role>): Promise<Role | null> {
    return this.prismaService.role.update({ where: { id }, data: role });
  }
}
