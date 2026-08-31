import bcrypt from 'bcryptjs';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ExecutorUser,
  Role,
  Users,
  UserSecured,
  UsersRepository,
} from '../../domain';
import { CreateUserDto } from '../dtos';
import * as crypto from 'crypto';

export interface ResponseData extends UserSecured {
  temporaryPassword: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    user: CreateUserDto,
    executor: ExecutorUser,
  ): Promise<ResponseData> {
    const executorExists = await this.usersRepository.findById(executor.sub);
    if (!executorExists) throw new UnauthorizedException('Executor not found');

    if (executor.role !== Role.ADMIN && executor.role !== Role.SUPERADMIN)
      throw new UnauthorizedException('User must be admin');

    const userExists = await this.usersRepository.findByEmail(user.email);
    if (userExists)
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'User already exists',
      });

    if (user.role === 'ADMIN' && executor.role !== Role.SUPERADMIN)
      throw new UnauthorizedException('User must be super admin');

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const userCreated = new Users(
      crypto.randomUUID(),
      user.email,
      user.username || '',
      user.firstName || '',
      user.lastName || '',
      hashedPassword,
      Role.USER,
      true,
      true,
      new Date(),
      new Date(),
    );

    const result = await this.usersRepository.save(userCreated);
    if (!result) throw new Error('Error creating user');

    return {
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role,
      mustChangePassword: result.mustChangePassword,
      firstName: result.firstName,
      lastName: result.lastName,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      temporaryPassword,
    };
  }
}
