import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../domain';

export interface ResponseDeactivateUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

@Injectable()
export class DeactivateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string): Promise<ResponseDeactivateUser> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user && !user.isActive) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      };
    }

    const userUpdated = await this.usersRepository.update(userId, {
      isActive: false,
    });
    if (!userUpdated) throw new BadRequestException('Error updating user');

    return {
      id: userUpdated.id,
      username: userUpdated.username,
      email: userUpdated.email,
      isActive: userUpdated.isActive,
    };
  }
}
