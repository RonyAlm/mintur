// import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { Role, Users, UsersRepository } from '../../domain';

describe.only('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;

  let mockUserRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    useCase = new CreateUserUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });
});
