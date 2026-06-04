export declare enum Role {
    USER = "user",
    ADMIN = "admin",
    SUPERADMIN = "superadmin"
}
export declare class Users {
    readonly id: string;
    readonly name: string;
    readonly email: string;
    readonly password: string;
    readonly role: Role;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    constructor(id: string, name: string, email: string, password: string, role: Role, createdAt: Date, updatedAt: Date);
}
export type UsersWithoutPassword = Omit<Users, 'password'>;
