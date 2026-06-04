import { Users, UsersWithoutPassword } from '../entities';
export declare abstract class UsersRepository {
    abstract findAll(): Promise<UsersWithoutPassword[]>;
    abstract findById(id: string): Promise<UsersWithoutPassword | null>;
    abstract findByEmail(email: string): Promise<Users | null>;
    abstract save(user: Users): Promise<Users>;
    abstract delete(id: string): Promise<void>;
    abstract update(id: string, user: Partial<Users>): Promise<Users | null>;
}
