import bcrypt from 'bcryptjs';
import * as crypto from 'crypto';
import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users, UserSecured, UsersRepository } from '../../domain';
// import { RoleRepository } from '../../../../modules/roles/domain';
import { CreateUserDto } from '../dtos';
import { GetRoleByIdUseCase } from '../../../../modules/roles/application';

export interface ResponseData extends UserSecured {
  temporaryPassword: string;
}

@Injectable()
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
  ) {}

  async execute(dto: CreateUserDto): Promise<ResponseData> {
    // const executorExists = await this.usersRepository.findById(executor.sub);
    // if (!executorExists) throw new UnauthorizedException('Executor not found');

    // if (executor.role !== Role.ADMIN && executor.role !== Role.SUPERADMIN)
    //   throw new UnauthorizedException('User must be admin');

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

    // if (user.role === 'ADMIN' && executor.role !== Role.SUPERADMIN)
    //   throw new UnauthorizedException('User must be super admin');

    const roleDefault = dto.roleId || 'cfb7af81-b4fc-4c57-9c35-34f9e13910eb'; // Role USER

    const role = await this.getRoleByIdUseCase.execute(roleDefault);
    if (!role) throw new NotFoundException('El rol indicado no existe');

    const temporaryPassword = crypto.randomBytes(6).toString('hex');
    const hashedPassword = await bcrypt.hash(temporaryPassword, 10);
    const userCreated = new Users(
      crypto.randomUUID(),
      dto.email,
      dto.username,
      dto.firstName || '',
      dto.lastName || '',
      hashedPassword,
      role.id,
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
