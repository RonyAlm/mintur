import { User as UserTable } from 'src/generated/prisma/client';
import { Role, Users } from '../../domain/entities/';

export class UserMapper {
  static toDomain(raw: UserTable): Users {
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

  static toDomainList(raw: UserTable[]): Users[] {
    return raw.map((user) => this.toDomain(user));
  }
}
