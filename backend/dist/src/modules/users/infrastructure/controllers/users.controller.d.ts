import { PrismaUsersRepository } from '../persistence';
export declare class UsersController {
    private readonly prismaUserRepository;
    constructor(prismaUserRepository: PrismaUsersRepository);
    getAllUsers(): Promise<import("../../domain").UsersWithoutPassword[]>;
}
