import { Permission } from '../entities';

export abstract class PermissionRepository {
  abstract findAll(): Promise<Permission[] | []>;
  abstract findById(id: string): Promise<Permission | null>;
  abstract findByName(name: string): Promise<Permission | null>;
  abstract save(permission: Permission): Promise<Permission>;
  abstract update(
    id: string,
    permission: Partial<Permission>,
  ): Promise<Permission | null>;
}
