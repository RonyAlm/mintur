"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const users_entity_1 = require("./domain/entities/users.entity");
const crypto_1 = require("crypto");
const prisma_service_1 = require("../prisma/prisma.service");
let UsersService = class UsersService {
    prismaService;
    constructor(prismaService) {
        this.prismaService = prismaService;
    }
    getAllUsers() {
        return this.prismaService.user.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }
    async getUserById(id) {
        return this.prismaService.user.findUnique({ where: { id } });
    }
    async findOneByEmail(email) {
        const user = await this.prismaService.user.findUnique({ where: { email } });
        if (!user)
            return null;
        return user;
    }
    async create(createUserDto) {
        const newUser = {
            id: (0, crypto_1.randomUUID)(),
            name: createUserDto.name,
            email: createUserDto.email,
            password: createUserDto.password,
            role: users_entity_1.Role.USER,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const user = await this.findOneByEmail(newUser.email);
        if (user)
            throw new common_1.BadRequestException('User already exists');
        const userCreated = await this.prismaService.user.create({ data: newUser });
        return userCreated;
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map