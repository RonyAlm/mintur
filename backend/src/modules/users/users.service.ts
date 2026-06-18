// import { BadRequestException, Injectable } from '@nestjs/common';
// import { Role, Users } from './domain/entities/users.entity';
// import { randomUUID } from 'crypto';
// // import { UpdateUserDto } from './dto/update-user.dto';
// import { PrismaService } from 'src/modules/prisma/prisma.service';
// import { CreateUserDto } from './applications/dtos/create-user.dto';

// @Injectable()
// export class UsersService {
//   constructor(private readonly prismaService: PrismaService) {}

//   getAllUsers() {
//     return this.prismaService.user.findMany({
//       select: {
//         id: true,
//         name: true,
//         email: true,
//         role: true,
//         createdAt: true,
//         updatedAt: true,
//       },
//     });
//   }

//   async getUserById(id: string) {
//     return this.prismaService.user.findUnique({ where: { id } });
//   }

//   async findOneByEmail(email: string) {
//     const user = await this.prismaService.user.findUnique({ where: { email } });
//     if (!user) return null;
//     return user;
//   }

//   async create(createUserDto: CreateUserDto) {
//     const newUser: Users = {
//       id: randomUUID(),
//       name: createUserDto.name,
//       email: createUserDto.email,
//       password: createUserDto.password,
//       role: Role.USER,
//       createdAt: new Date(),
//       updatedAt: new Date(),
//     };
//     const user = await this.findOneByEmail(newUser.email);
//     if (user) throw new BadRequestException('User already exists');

//     const userCreated = await this.prismaService.user.create({ data: newUser });
//     return userCreated;
//   }
// }
