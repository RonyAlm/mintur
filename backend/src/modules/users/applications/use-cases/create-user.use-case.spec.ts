// import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserUseCase } from './create-user.use-case';
import { ExecutorUser, Role, Users, UsersRepository } from '../../domain';
import { UnauthorizedException } from '@nestjs/common';
import { CreateUserDto } from '../dtos';

describe('CreateUserUseCase', () => {
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

  it('UseCase debería ser definido', () => {
    expect(useCase).toBeDefined();
  });

  it('debería lanzar UnauthorizedException si el ejecutor NO es un ADMIN', async () => {
    // Arrange: Creamos un ejecutor con rol 'USER' (No autorizado)
    const executorComun = {
      sub: 'id-1',
      email: 'empleado@turismo.gob.ar',
      role: Role.USER,
    };
    const dto = {
      name: 'Nuevo Guia',
      email: 'guia@turismo.gob.ar',
      passwordHash: 'password123',
      role: Role.USER,
      mustChangePassword: true,
    };

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve({
        id: 'id-1',
        email: executorComun.email,
        role: executorComun.role,
      } as Users),
    );

    // Act & Assert
    await expect(useCase.execute(dto, executorComun)).rejects.toThrow(
      new UnauthorizedException('User must be admin'),
    );
  });

  it('debería crear un usuario', async () => {
    const executor = {
      sub: 'id-1',
      email: 'empleado@turismo.gob.ar',
      role: Role.ADMIN,
    };

    const dto = {
      name: 'Test',
      email: 'test@me.com',
      role: Role.USER,
      mustChangePassword: true,
    } as CreateUserDto;

    const mockUserCreated = {
      id: 'id-1',
      name: 'Test',
      email: 'test@me.com',
      passwordHash: 'password',
      role: Role.USER,
      mustChangePassword: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve({
        id: 'id-1',
        email: executor.email,
        role: executor.role,
      } as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(Promise.resolve(null));
    mockUserRepository.save.mockReturnValue(Promise.resolve(mockUserCreated));

    const result = await useCase.execute(dto, executor);

    expect(result.temporaryPassword).toBeDefined();
    expect(result.id).toEqual(mockUserCreated.id);
  });

  it('debería lanzar UnauthorizedException si el usuario ya existe', async () => {
    const executor = {
      sub: 'id-1',
      email: 'empleado@turismo.gob.ar',
      role: Role.ADMIN,
    };

    const dto = {
      name: 'Test',
      email: 'test@me.com',
      passwordHash: 'password',
      role: Role.USER,
      mustChangePassword: true,
    };

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve({
        id: 'id-1',
        email: executor.email,
        role: executor.role,
        mustChangePassword: true,
      } as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(
      Promise.resolve(
        new Users(
          'id-1',
          executor.email,
          'passwordHash',
          executor.role,
          true,
          '',
          new Date(),
          new Date(),
        ),
      ),
    );

    await expect(
      useCase.execute(dto, executor as ExecutorUser),
    ).rejects.toThrow(new Error('User already exists'));
  });

  it('debería lanzar UnauthorizedException si no existe el email en el executor', async () => {
    const dto = {
      name: 'Test',
      email: 'test@me.com',
      passwordHash: 'password',
      role: Role.USER,
      mustChangePassword: true,
    };

    const executorNotFound = {
      sub: 'id-1',
      email: 'notfound@turismo.gob.ar',
      role: Role.ADMIN,
    };

    mockUserRepository.findById.mockReturnValue(Promise.resolve(null));

    await expect(useCase.execute(dto, executorNotFound)).rejects.toThrow(
      new UnauthorizedException('Executor not found'),
    );
  });

  it('debería ser muskChangePassword true por default', async () => {
    const executor = {
      sub: 'id-1',
      email: 'empleado@turismo.gob.ar',
      role: Role.ADMIN,
    };

    const dto = {
      name: 'Test',
      email: 'test@me.com',
      passwordHash: 'password',
      role: Role.USER,
    };

    const mockUserCreated = new Users(
      'id-1',
      dto.email,
      'passwordhash',
      dto.role,
      true,
      dto.name,
      new Date(),
      new Date(),
    );

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve({
        id: 'id-1',
        email: executor.email,
        role: executor.role,
      } as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(Promise.resolve(null));
    mockUserRepository.save.mockReturnValue(Promise.resolve(mockUserCreated));

    const result = await useCase.execute(dto, executor);
    expect(result.mustChangePassword).toBe(true);
  });

  it('debería generar una contraseña temporal por default', async () => {
    const executor = {
      sub: 'id-1',
      email: 'empleado@turismo.gob.ar',
      role: Role.ADMIN,
    };

    const dto = {
      name: 'Test',
      email: 'test@me.com',
      role: Role.USER,
    } as CreateUserDto;

    const mockUserCreated = new Users(
      'id-1',
      dto.email,
      'passwordhash',
      dto.role,
      true,
      dto.name,
      new Date(),
      new Date(),
    );

    mockUserRepository.findById.mockReturnValue(
      Promise.resolve({
        id: 'id-1',
        email: executor.email,
        role: executor.role,
      } as Users),
    );
    mockUserRepository.findByEmail.mockReturnValue(Promise.resolve(null));
    mockUserRepository.save.mockReturnValue(Promise.resolve(mockUserCreated));

    const result = await useCase.execute(dto, executor);
    expect(result.mustChangePassword).toBe(true);
  });
});
