import { PrismaService } from "../prisma/prisma.service";
import { CreateUserDto } from './applications/dtos/create-user.dto';
export declare class UsersService {
    private readonly prismaService;
    constructor(prismaService: PrismaService);
    getAllUsers(): import("../../generated/prisma/internal/prismaNamespace").PrismaPromise<{
        id: string;
        name: string;
        email: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    getUserById(id: string): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    findOneByEmail(email: string): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    } | null>;
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        email: string;
        password: string;
        role: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
