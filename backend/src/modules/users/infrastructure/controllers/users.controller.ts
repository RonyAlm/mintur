import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { Role } from '../../domain';
import {
  CreateUserUseCase,
  CreateUserDto,
  ResetUserPasswordUseCase,
  UpdateUserUseCase,
  UpdateUserDto,
} from '../../applications';
import { Activeuser, type ExecutorUser } from '../../../../core';
import { Auth } from '../../../../core/decorators';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
  ) {}

  @Get()
  getAllUsers() {
    // return this.prismaUserRepository.findAll();
    return [];
  }

  // @Get(':id')
  // getUserById(@Param('id') id: string): User {
  //   return this.usersService.getUserById(id);
  // }

  @Post('create')
  @Auth(Role.ADMIN)
  async createUser(
    @Body() dto: CreateUserDto,
    @Activeuser() executor: ExecutorUser,
  ) {
    // const executorTest = {
    //   sub: 'id-1',
    //   email: 'empleado@turismo.gob.ar',
    //   role: Role.SUPERADMIN,
    // };
    return this.createUserUseCase.execute(dto, executor);
  }

  @Patch(':id/reset-password')
  @Auth(Role.ADMIN)
  resetUserPassword(
    @Param('id') userId: string,
    @Activeuser() executor: ExecutorUser,
  ) {
    return this.resetUserPasswordUseCase.execute(userId, executor);
  }

  @Patch(':id')
  @Auth(Role.USER)
  updateUser(@Param('id') id: string, @Body() updatedFields: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updatedFields);
  }

  // @Delete(':id')
  // deleteUser(@Param('id') id: string) {
  //   return this.usersService.deleteUser(id);
  // }

  // @Patch(':id')
  // updateUser(@Param('id') id: string, @Body() updatedFields: UpdateUserDto) {
  //   return this.usersService.updateUser(id, updatedFields);
  // }
}
