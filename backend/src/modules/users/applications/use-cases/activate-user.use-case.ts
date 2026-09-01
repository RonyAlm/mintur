import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../domain';

export interface ResponseActivateUser {
  id: string;
  username: string;
  email: string;
  isActive: boolean;
}

@Injectable()
export class ActivateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string): Promise<ResponseActivateUser> {
    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('User not found');

    if (user && user.isActive) {
      return {
        id: user.id,
        username: user.username,
        email: user.email,
        isActive: user.isActive,
      };
    }

    const userUpdated = await this.usersRepository.update(userId, {
      isActive: true,
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
