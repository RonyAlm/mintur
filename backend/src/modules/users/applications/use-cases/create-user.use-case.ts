import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users, UserSecured, UsersRepository } from '../../domain';
import { CreateUserDto } from '../dtos';
import {
  GetRoleByIdUseCase,
  ListRolesUseCase,
} from '../../../../modules/roles/application';

export interface ResponseData extends UserSecured {
  temporaryPassword: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  async execute(dto: CreateUserDto): Promise<ResponseData> {
    const userExists = await this.usersRepository.findByEmail(dto.email.trim());
    if (userExists)
      throw new ConflictException('Ya existe un usuario con ese email');

    const usernameExists = await this.usersRepository.findByUsername(
      dto.username.trim(),
    );
    if (usernameExists)
      throw new ConflictException(
        'Ya existe un usuario con ese nombre de usuario',
      );

    if (dto.roleId) {
      const roleExists = await this.getRoleByIdUseCase.execute(
        dto.roleId.trim(),
      );
      if (!roleExists) throw new NotFoundException('Rol no encontrado');
    }

    const roles = await this.listRolesUseCase.execute();
    const roleDefault =
      roles.length > 0 && roles.find((role) => role.name === 'USER');
    if (!roleDefault) throw new NotFoundException('Rol no encontrado');

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const userCreated = new Users(
      crypto.randomUUID(),
      dto.email,
      dto.username,
      dto.firstName || '',
      dto.lastName || '',
      hashedPassword,
      dto.roleId || roleDefault.id,
      true,
      true,
      new Date(),
      new Date(),
    );

    const result = await this.usersRepository.save(userCreated);
    if (!result) throw new ConflictException('Error al crear el usuario');

    return {
      id: result.id,
      username: result.username,
      email: result.email,
      roleId: result.roleId,
      mustChangePassword: result.mustChangePassword,
      firstName: result.firstName,
      lastName: result.lastName,
      isActive: result.isActive,
      createdAt: result.createdAt,
      updatedAt: result.updatedAt,
      temporaryPassword,
    };
  }
}
