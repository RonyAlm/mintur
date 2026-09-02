import { Injectable } from '@nestjs/common';
import { UserSecured, UsersRepository } from '../../domain';

@Injectable()
export class ListUsersUseCase {
  constructor(private readonly usersRepository: UsersRepository) {}
  async execute(): Promise<UserSecured[] | []> {
    return await this.usersRepository.findAll();
  }
}
