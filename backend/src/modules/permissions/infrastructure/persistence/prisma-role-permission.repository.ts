import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../modules/prisma/prisma.service';
import { RolePermission, RolePermissionRepository } from '../../domain';
import { RolePermissionMapper } from './role-permission.mappers';

@Injectable()
export class PrismaRolePermissionRepository implements RolePermissionRepository {
  constructor(private readonly prismaService: PrismaService) {}

  async create(roleId: string, permissionId: string): Promise<RolePermission> {
    const rolePermission = await this.prismaService.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    return RolePermissionMapper.toDomain(rolePermission);
  }

  async delete(roleId: string, permissionId: string): Promise<void> {
    await this.prismaService.rolePermission.delete({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
  }

  async exists(roleId: string, permissionId: string): Promise<boolean> {
    const rolePermission = await this.prismaService.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId, permissionId } },
    });
    return !!rolePermission;
  }
}
