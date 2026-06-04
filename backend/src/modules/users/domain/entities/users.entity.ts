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
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  // isAdmin(): boolean {
  //   return this.role === Role.ADMIN;
  // }
}

export type UsersWithoutPassword = Omit<Users, 'password'>;
