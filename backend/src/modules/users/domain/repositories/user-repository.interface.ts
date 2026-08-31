import { Users, UserSecured } from '../entities';

export abstract class UsersRepository {
  abstract findAll(): Promise<UserSecured[]>;
  abstract findById(id: string): Promise<Users | null>;
  abstract findByEmail(email: string): Promise<Users | null>;
  abstract findByUsername(username: string): Promise<Users | null>;
  abstract save(user: Users): Promise<UserSecured>;
  abstract delete(id: string): Promise<void>;
  abstract update(id: string, user: Partial<Users>): Promise<Users | null>;
}
