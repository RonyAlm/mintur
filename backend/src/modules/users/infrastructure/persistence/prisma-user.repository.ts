import { Injectable } from '@nestjs/common';
import { Users, UsersWithoutPassword } from '../../domain/entities';
import { PrismaService } from '../../../prisma/prisma.service';
import { UsersRepository } from '../../domain';
import { UserMapper } from './user.mapper';

@Injectable()
export class PrismaUsersRepository implements UsersRepository {
  constructor(private readonly prismaService: PrismaService) {}
  async findAll(): Promise<UsersWithoutPassword[]> {
    const users = await this.prismaService.user.findMany();
    if (!users) return [];
    return UserMapper.toDomainList(users);
  }
  async findByEmail(email: string): Promise<Users | null> {
    const user = await this.prismaService.user.findUnique({ where: { email } });
    if (!user) return null;
    return UserMapper.toDomain(user);
  }
  findById(id: string): Promise<Users | null> {
    throw new Error('Method not implemented.' + id);
  }
  save(user: Users): Promise<Users> {
    throw new Error('Method not implemented.', { cause: user });
  }
  delete(id: string): Promise<void> {
    throw new Error('Method not implemented.' + id);
  }
  update(id: string, user: Partial<Users>): Promise<Users | null> {
    throw new Error('Method not implemented.');
  }
}
