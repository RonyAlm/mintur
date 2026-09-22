import { RolePermission } from '../../../../core/lib/generated/prisma/client';
import { RolePermission as RolePermissionEntity } from '../../domain';

export interface RolePermissionTable extends RolePermission {
  roleId: string;
  permissionId: string;
}

export class RolePermissionMapper {
  static toDomain(raw: RolePermissionTable): RolePermissionEntity {
    return {
      roleId: raw.roleId,
      permissionId: raw.permissionId,
    };
  }

  static toDomainList(raws: RolePermissionTable[]): RolePermissionEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }
}
