import { User } from '../../../../core/lib/generated/prisma/client';
import { Role, Users, UserSecured } from '../../domain/entities/';

interface UserTable extends User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  role: Role;
  mustChangePassword: boolean;
}

export class UserMapper {
  static toDomainPrivate(raw: UserTable): Users {
    return {
      id: raw.id,
      email: raw.email,
      passwordHash: raw.passwordHash,
      role: raw.role,
      mustChangePassword: raw.mustChangePassword,
      name: raw.name || '',
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    } as Users;
  }

  static toDomain(raw: UserTable): UserSecured {
    return {
      id: raw.id,
      name: raw.name || '',
      email: raw.email,
      role: raw.role,
      mustChangePassword: raw.mustChangePassword,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(raw: UserTable[]): UserSecured[] {
    return raw.map((user) => ({
      id: user.id,
      name: user.name || '',
      email: user.email,
      role: user.role,
      mustChangePassword: user.mustChangePassword,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }));
  }
}
