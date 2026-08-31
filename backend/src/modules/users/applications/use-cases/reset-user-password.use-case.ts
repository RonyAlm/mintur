import bcrypt from 'bcryptjs';
import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ExecutorUser, Role, UsersRepository } from '../../domain';
import * as crypto from 'crypto';

export interface ResponseResetPassword {
  id: string;
  username: string | null;
  email: string;
  role: Role;
  mustChangePassword: boolean;
  temporaryPassword: string;
}

@Injectable()
export class ResetUserPasswordUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(
    userId: string,
    executor: ExecutorUser,
  ): Promise<ResponseResetPassword> {
    const executorExists = await this.usersRepository.findById(executor.sub);
    if (!executorExists) throw new UnauthorizedException('Executor not found');

    if (executor.role !== Role.ADMIN && executor.role !== Role.SUPERADMIN)
      throw new UnauthorizedException('User must be admin');

    const userExists = await this.usersRepository.findById(userId);
    if (!userExists) throw new BadRequestException('User not found');

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);

    const result = await this.usersRepository.update(userId, {
      passwordHash: hashedPassword,
      mustChangePassword: true,
    }); //TODO: Despues agregar passwordChangedAt: new Date(),
    if (!result) throw new Error('Error updating user');

    return {
      id: result.id,
      username: result.username,
      email: result.email,
      role: result.role,
      mustChangePassword: result.mustChangePassword,
      temporaryPassword,
    };
  }
}
