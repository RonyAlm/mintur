import { Permission } from '../../../../core/lib/generated/prisma/client';
import { Permission as PermissionEntity } from '../../domain';

export class PermissionMapper {
  static toDomain(raw: Permission): PermissionEntity {
    return {
      id: raw.id,
      name: raw.name,
      description: raw.description || '',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(raws: Permission[]): PermissionEntity[] {
    return raws.map((raw) => this.toDomain(raw));
  }
}
