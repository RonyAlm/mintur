import { User as UserTable } from "../../../../generated/prisma/client";
import { Users, UserSecured } from '../../domain/entities/';
export declare class UserMapper {
    static toDomainPrivate(raw: UserTable): Users;
    static toDomain(raw: UserTable): UserSecured;
    static toDomainList(raw: UserTable[]): UserSecured[];
}
