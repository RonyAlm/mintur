import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { UsersRepository } from '../../domain';
import { UpdateUserDto } from '../dtos';

@Injectable()
export class UpdateUserUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(userId: string, dto: UpdateUserDto) {
    userId = userId.trim();

    const user = await this.usersRepository.findById(userId);
    if (!user) throw new NotFoundException('No se encontró el usuario');

    if (dto.email && dto.email !== user.email) {
      const userExists = await this.usersRepository.findByEmail(dto.email);
      if (userExists)
        throw new ConflictException('El email ya está en uso por otro usuario');
    }

    if (dto.username && dto.username !== user.username) {
      const userExists = await this.usersRepository.findByUsername(
        dto.username,
      );
      if (userExists)
        throw new ConflictException(
          'El nombre de usuario ya está en uso por otro usuario',
        );
    }

    Object.assign(user, dto);

    const userUpdated = await this.usersRepository.update(userId, user);
    if (!userUpdated)
      throw new ConflictException('No se pudo actualizar el usuario');

    return {
      id: userUpdated.id,
      username: userUpdated.username,
      firstName: userUpdated.firstName,
      lastName: userUpdated.lastName,
      email: userUpdated.email,
      roleId: userUpdated.roleId,
    };
  }
}
