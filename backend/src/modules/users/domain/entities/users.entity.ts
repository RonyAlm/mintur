export enum Role {
  USER = 'user',
  ADMIN = 'admin',
  SUPERADMIN = 'superadmin',
}

export class Users {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role: Role,
    public readonly createdAt?: Date,
    public readonly updatedAt?: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === Role.ADMIN || this.role === Role.SUPERADMIN;
  }

  isSuperAdmin(): boolean {
    return this.role === Role.SUPERADMIN;
  }
}

export type UserSecured = Omit<Users, 'password' | 'isAdmin' | 'isSuperAdmin'>;
