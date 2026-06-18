import { User as UserTable } from 'src/generated/prisma/client';
import { Role, Users, UserSecured } from '../../domain/entities/';

export class UserMapper {
  static toDomainPrivate(raw: UserTable): Users {
    return new Users(
      raw.id,
      raw.name,
      raw.email,
      raw.password,
      raw.role as Role,
      raw.createdAt,
      raw.updatedAt,
    );
  }
  static toDomain(raw: UserTable): UserSecured {
    return {
      id: raw.id,
      name: raw.name,
      email: raw.email,
      role: raw.role as Role,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }

  static toDomainList(raw: UserTable[]): UserSecured[] {
    return raw.map((user) => this.toDomain(user));
  }
}
