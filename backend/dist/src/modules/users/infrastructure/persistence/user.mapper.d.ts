import { User as UserTable } from "../../../../generated/prisma/client";
import { Users } from '../../domain/entities/';
export declare class UserMapper {
    static toDomain(raw: UserTable): Users;
    static toDomainList(raw: UserTable[]): Users[];
}
