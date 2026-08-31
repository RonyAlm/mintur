import { Injectable } from '@nestjs/common';
import { Users, UserSecured } from '../../domain/entities';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from '../../domain';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll(): Promise<UserSecured[] | []> {
    const users = await this.prismaService.user.findMany();
    if (!users) return [];
    return UserMapper.toDomainList(users);
  }
  async findByEmail(email: string): Promise<Users | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserMapper.toDomainPrivate(user);
  }
  async findById(id: string): Promise<Users | null> {
    const user = await this.prismaService.user.findUnique({ where: { id } });
    if (!user) return null;
    return UserMapper.toDomainPrivate(user);
  }

  async findByUsername(username: string): Promise<Users | null> {
    const user = await this.prismaService.user.findUnique({
      where: { username },
    });
    if (!user) return null;
    return UserMapper.toDomainPrivate(user);
  }

  async save(user: Users): Promise<UserSecured> {
    const userCreated = await this.prismaService.user.create({ data: user });
    const result = UserMapper.toDomain(userCreated);
    return result;
  }

  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.' + id);
  }
  async update(id: string, user: Partial<Users>): Promise<Users | null> {
    const userExists = await this.prismaService.user.findUnique({
      where: { id },
    });
    if (!userExists) return null;

    const userUpdated = await this.prismaService.user.update({
      where: { id },
      data: user,
    });

    if (!userUpdated) return null;
    return UserMapper.toDomainPrivate(userUpdated);
  }
}
