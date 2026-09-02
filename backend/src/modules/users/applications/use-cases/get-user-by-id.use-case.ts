import { Injectable, NotFoundException } from '@nestjs/common';
import { UserSecured, UsersRepository } from '../../domain';

@Injectable()
export class GetUserByIdUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(id: string): Promise<UserSecured | null> {
    id = id.trim();
    if (!id) throw new NotFoundException('User not found');
    const user = await this.usersRepository.findById(id);
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      mustChangePassword: user.mustChangePassword,
      role: user.role,
    } as UserSecured;
  }
}
