// import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { Role, Users, UsersRepository } from '../../domain';
import { UnauthorizedException } from '@nestjs/common';

describe('CreateUserUseCase', () => {
  let useCase: CreateUserUseCase;
  const executorAdmin = { isAdmin: () => true };
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

  it('UseCase debería ser definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería lanzar UnauthorizedException si el ejecutor NO es un ADMIN', async () => {
    // Arrange: Creamos un ejecutor con rol 'USER' (No autorizado)
    const executorComun = new Users(
      'id-1',
      'empleado@turismo.gob.ar',
      'hash',
      'Juan Perez',
      Role.USER,
    );
    const dto = {
      name: 'Nuevo Guia',
      email: 'guia@turismo.gob.ar',
      password: 'password123',
      role: 'USER',
    };

    mockUserRepository.findById.mockReturnValue(Promise.resolve(executorComun));

    // Act & Assert
    await expect(useCase.execute(dto, executorComun)).rejects.toThrow(
      new UnauthorizedException('User must be admin'),
    );
  });

  it('debería crear un usuario', async () => {
    const dto = {
      name: 'Test',
      email: 'test@me.com',
      password: 'password',
      role: Role.ADMIN,
    };

    const mockUserCreated = new Users(
      'id-1',
      dto.name,
      dto.email,
      'passwordhash',
      dto.role,
    );

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve(executorAdmin as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(Promise.resolve(null));
    mockUserRepository.save.mockReturnValue(Promise.resolve(mockUserCreated));

    const result = await useCase.execute(dto, executorAdmin as Users);
    expect(result).toEqual(mockUserCreated);
  });

  it('debería lanzar UnauthorizedException si el usuario ya existe', async () => {
    const dto = {
      name: 'Test',
      email: 'test@me.com',
      password: 'password',
      role: Role.USER,
    };

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve(executorAdmin as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(
      Promise.resolve(
        new Users(
          'id-1',
          dto.name,
          dto.email,
          'passwordhash',
          dto.role,
          new Date(),
          new Date(),
        ),
      ),
    );

    await expect(useCase.execute(dto, executorAdmin as Users)).rejects.toThrow(
      new Error('User already exists'),
    );
  });

  it('debería lanzar UnauthorizedException si intentamos crear un SUPERADMIN sin ser SUPERADMIN', async () => {
    const dto = {
      name: 'Test',
      email: 'test@me.com',
      password: 'password',
      role: Role.SUPERADMIN,
    };

    const executorAdmin = new Users(
      'id-1',
      'empleado@turismo.gob.ar',
      'hash',
      'Juan Perez',
      Role.ADMIN,
    );

    mockUserRepository.findById.mockReturnValue(Promise.resolve(executorAdmin));
    mockUserRepository.save.mockReturnValue(
      Promise.resolve(
        new Users(
          'id-1',
          dto.name,
          dto.email,
          'passwordhash',
          dto.role,
          new Date(),
          new Date(),
        ),
      ),
    );

    await expect(useCase.execute(dto, executorAdmin)).rejects.toThrow(
      new UnauthorizedException('User must be super admin'),
    );
  });

  it('debería lanzar UnauthorizedException si no existe el email en el executor', async () => {
    const dto = {
      name: 'Test',
      email: 'test@me.com',
      password: 'password',
      role: Role.USER,
    };

    const executorNotFound = new Users(
      'id-1',
      'notfound@correo.com',
      'hash',
      'Juan Perez',
      Role.ADMIN,
    );

    mockUserRepository.findById.mockReturnValue(Promise.resolve(null));

    await expect(useCase.execute(dto, executorNotFound)).rejects.toThrow(
      new UnauthorizedException('Executor not found'),
    );
  });
});
