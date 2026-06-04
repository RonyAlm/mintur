// import { Test, TestingModule } from '@nestjs/testing';
import { FindUserByEmailUseCase } from './find-user-by-email.use-case';
import { Role, Users, UsersRepository } from '../../domain';

// describe('UsersService', () => {
//   let service: UsersService;

//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [UsersService],
//     }).compile();

//     service = module.get<UsersService>(UsersService);
//   });

//   it('should be defined', () => {
//     expect(service).toBeDefined();
//   });
// });

describe.only('FindUserByEmailUseCase', () => {
  let useCase: FindUserByEmailUseCase;

  let mockUserRepository: jest.Mocked<UsersRepository>;

  beforeEach(() => {
    mockUserRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByEmail: jest.fn(),
      save: jest.fn(),
    } as unknown as jest.Mocked<UsersRepository>;

    useCase = new FindUserByEmailUseCase(mockUserRepository);
  });

  it('should be defined', () => {
    expect(useCase).toBeDefined();
  });

  it('should return a user by email', async () => {
    const email = 'test@me.com';
    const user = {
      id: 'id',
      name: 'name',
      email: 'email',
      password: 'password',
    };
    const mockUserFound = new Users(
      user.id,
      user.name,
      email,
      user.password,
      Role.USER,
      new Date(),
      new Date(),
    );

    mockUserRepository.findByEmail.mockResolvedValue(mockUserFound);

    const result = await useCase.execute(email);

    expect(result).toBeInstanceOf(Users);
    expect(result).toEqual(mockUserFound);
    expect(result?.email).toBe(email);
  });

  it('should return null if user not found', async () => {
    const email = 'test@me.com';

    mockUserRepository.findByEmail.mockResolvedValue(null);

    const result = await useCase.execute(email);

    expect(result).toBeNull();
  });
});
