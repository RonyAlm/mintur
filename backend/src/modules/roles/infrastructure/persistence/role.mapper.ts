import { Role } from '../../../../core/lib/generated/prisma/client';

interface RoleTable extends Role {
  id: string;
  name: string;
  description: string | null;
  isSystemRole: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class RoleMapper {
  static toDomain(role: RoleTable): Role {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      isSystemRole: role.isSystemRole,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
    };
  }

  static toDomainList(roles: RoleTable[]): Role[] {
    return roles.map((role) => this.toDomain(role));
  }
}
