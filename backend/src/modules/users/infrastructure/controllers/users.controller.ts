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
  ActivateUserUseCase,
  DeactivateUserUseCase,
  GetUserByIdUseCase,
  ListUsersUseCase,
} from '../../applications';
import { Activeuser, type ExecutorUser } from '../../../../core';
import { Auth } from '../../../../core/decorators';

@Controller('users')
export class UsersController {
  constructor(
    private readonly createUserUseCase: CreateUserUseCase,
    private readonly resetUserPasswordUseCase: ResetUserPasswordUseCase,
    private readonly updateUserUseCase: UpdateUserUseCase,
    private readonly activateUserUseCase: ActivateUserUseCase,
    private readonly deactivateUserUseCase: DeactivateUserUseCase,
    private readonly getUserByIdUseCase: GetUserByIdUseCase,
    private readonly listUsersUseCase: ListUsersUseCase,
  ) {}

  @Get('')
  @Auth(Role.ADMIN)
  getAllUsers() {
    return this.listUsersUseCase.execute();
  }

  @Auth(Role.ADMIN)
  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return await this.getUserByIdUseCase.execute(id);
  }

  @Post('create')
  @Auth(Role.ADMIN)
  async createUser(
    @Body() dto: CreateUserDto,
    @Activeuser() executor: ExecutorUser,
  ) {
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

  @Patch(':id/activate')
  @Auth(Role.ADMIN)
  activateUser(@Param('id') userId: string) {
    return this.activateUserUseCase.execute(userId);
  }

  @Patch(':id/deactivate')
  @Auth(Role.ADMIN)
  deactivateUser(@Param('id') userId: string) {
    return this.deactivateUserUseCase.execute(userId);
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
