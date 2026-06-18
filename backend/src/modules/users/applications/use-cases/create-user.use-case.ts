import bcrypt from 'bcryptjs';
import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Role, Users, UserSecured, UsersRepository } from '../../domain';
import { CreateUserDto } from '../dtos';

@Injectable()
export class CreateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(user: CreateUserDto, executor: Users): Promise<UserSecured> {
    const executorExists = await this.usersRepository.findById(executor.id);
    if (!executorExists) throw new UnauthorizedException('Executor not found');

    if (!executor.isAdmin())
      throw new UnauthorizedException('User must be admin');

    const userExists = await this.usersRepository.findByEmail(user.email);
    if (userExists)
      throw new ConflictException({
        statusCode: 409,
        error: 'Conflict',
        message: 'User already exists',
      });

    if (user.role === Role.SUPERADMIN && !executor.isSuperAdmin())
      throw new UnauthorizedException('User must be super admin');

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const userCreated = new Users(
      crypto.randomUUID(),
      user.name,
      user.email,
      hashedPassword,
      Role.USER,
      new Date(),
      new Date(),
    );

    const result = await this.usersRepository.save(userCreated);
    if (!result) throw new Error('Error creating user');

    return result;
  }
}
