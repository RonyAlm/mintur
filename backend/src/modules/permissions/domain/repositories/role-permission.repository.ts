import { RolePermission } from '../entities';

export abstract class RolePermissionRepository {
  abstract create(
    roleId: string,
    permissionId: string,
  ): Promise<RolePermission>;
  abstract delete(roleId: string, permissionId: string): Promise<void>;
  abstract exists(roleId: string, permissionId: string): Promise<boolean>;
}
