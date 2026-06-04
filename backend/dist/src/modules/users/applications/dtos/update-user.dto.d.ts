import { Role } from '../../domain/entities/users.entity';
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    password?: string;
    role?: Role;
}
