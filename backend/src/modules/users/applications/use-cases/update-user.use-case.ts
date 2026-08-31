import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../domain';
import { UpdateUserDto } from '../dtos';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string, dto: UpdateUserDto) {
    userId = userId.trim();

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new Error('User not found');

    if (dto.email && dto.email !== user.email) {
      const userExists = await this.usersRepository.findByEmail(dto.email);
      if (userExists) throw new Error('User already exists');
    }

    if (dto.username && dto.username !== user.username) {
      const userExists = await this.usersRepository.findByUsername(
        dto.username,
      );
      if (userExists) throw new Error('User already exists');
    }

    Object.assign(user, dto);

    const userUpdated = await this.usersRepository.update(userId, user);
    if (!userUpdated) throw new Error('Error updating user');

    return {
      id: userUpdated.id,
      username: userUpdated.username,
      firstName: userUpdated.firstName,
      lastName: userUpdated.lastName,
      email: userUpdated.email,
      role: userUpdated.role,
    };
  }
}
