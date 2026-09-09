import { User } from '../../../../core/lib/generated/prisma/client';
import { Users, UserSecured } from '../../domain/entities/';

interface UserTable extends User {
  id: string;
  email: string;
  passwordHash: string;
  roleId: string;
  mustChangePassword: boolean;
  username: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class UserMapper {
  static toDomainPrivate(raw: UserTable): Users {
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      roleId: raw.roleId,
      mustChangePassword: raw.mustChangePassword,
      username: raw.username,
      firstName: raw.firstName,
      lastName: raw.lastName,
      isActive: raw.isActive,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomain(raw: UserTable): UserSecured {
    return {
      id: raw.id,
      username: raw.username,
      firstName: raw.firstName,
      lastName: raw.lastName,
      isActive: raw.isActive,
      email: raw.email,
      roleId: raw.roleId,
      mustChangePassword: raw.mustChangePassword,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(raw: UserTable[]): UserSecured[] {
    return raw.map((user) => ({
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      roleId: user.roleId,
      mustChangePassword: user.mustChangePassword,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
