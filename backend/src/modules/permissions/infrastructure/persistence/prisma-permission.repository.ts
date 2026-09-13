import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { Permission, PermissionRepository } from '../../domain';
import { PermissionMapper } from './permission.mappers';

@Injectable()
export class PrismaPermissionRepository implements PermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async findAll(): Promise<Permission[] | []> {
    const permissions = await this.prismaService.permission.findMany();
    return PermissionMapper.toDomainList(permissions);
  }

  async findByName(name: string): Promise<Permission | null> {
    const permission = await this.prismaService.permission.findUnique({
      where: { name },
    });
    if (!permission) return null;
    return PermissionMapper.toDomain(permission);
  }

  async findById(id: string): Promise<Permission | null> {
    const permission = await this.prismaService.permission.findUnique({
      where: { id },
    });
    if (!permission) return null;
    return PermissionMapper.toDomain(permission);
  }

  async save(permission: Permission): Promise<Permission> {
    const newPermission = await this.prismaService.permission.create({
      data: permission,
    });
    return PermissionMapper.toDomain(newPermission);
  }

  async update(
    id: string,
    permission: Partial<Permission>,
  ): Promise<Permission | null> {
    const updatedPermission = await this.prismaService.permission.update({
      where: { id },
      data: permission,
    });
    if (!updatedPermission) return null;
    return PermissionMapper.toDomain(updatedPermission);
  }
}
