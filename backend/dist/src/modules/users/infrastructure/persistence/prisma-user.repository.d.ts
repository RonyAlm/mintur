import { Users, UsersWithoutPassword } from '../../domain/entities';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from '../../domain';
export declare class PrismaUsersRepository implements UsersRepository {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    findAll(): Promise<UsersWithoutPassword[]>;
    findByEmail(email: string): Promise<Users | null>;
    findById(id: string): Promise<Users | null>;
    save(user: Users): Promise<Users>;
    delete(id: string): Promise<void>;
    update(id: string, user: Partial<Users>): Promise<Users | null>;
}
