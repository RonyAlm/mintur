export const Role = {
  USER: 'USER',
  ADMIN: 'ADMIN',
  SUPERADMIN: 'SUPERADMIN',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export class Users {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly username: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly passwordHash: string,
    public readonly role: Role,
    public readonly mustChangePassword: boolean,
    public readonly isActive: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  isAdmin(): boolean {
    return this.role === Role.ADMIN || this.role === Role.SUPERADMIN;
  }

  isSuperAdmin(): boolean {
    return this.role === Role.SUPERADMIN;
  }
}

export type UserSecured = Omit<
  Users,
  'passwordHash' | 'isAdmin' | 'isSuperAdmin'
>;

export type ExecutorUser = {
  sub: string;
  email: string;
  role: Role;
};
