import { Injectable } from '@nestjs/common';
import { Users, UsersRepository } from '../../domain';

@Injectable()
export class FindUserByEmailUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}

  async execute(email: string): Promise<Users | null> {
    return await this.usersRepository.findByEmail(email);
  }
}
