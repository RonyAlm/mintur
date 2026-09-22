import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
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
import { Auth } from '../../../../core/decorators';

@Controller('users')
// @UseGuards(JwtAuthGuard, PermissionGuard)
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
  @Auth('users:read')
  getAllUsers() {
    return this.listUsersUseCase.execute();
  }

  @Get(':id')
  @Auth('users:read')
  async getUserById(@Param('id') id: string) {
    return await this.getUserByIdUseCase.execute(id);
  }

  @Post('create')
  @Auth('users:create')
  async createUser(@Body() dto: CreateUserDto) {
    return this.createUserUseCase.execute(dto);
  }

  @Patch(':id/reset-password')
  @Auth('users:reset_password')
  resetUserPassword(@Param('id') userId: string) {
    return this.resetUserPasswordUseCase.execute(userId);
  }

  @Patch(':id')
  @Auth('users:update')
  updateUser(@Param('id') id: string, @Body() updatedFields: UpdateUserDto) {
    return this.updateUserUseCase.execute(id, updatedFields);
  }

  @Patch(':id/activate')
  @Auth('users:activate')
  activateUser(@Param('id') userId: string) {
    return this.activateUserUseCase.execute(userId);
  }

  @Patch(':id/deactivate')
  @Auth('users:deactivate')
  deactivateUser(@Param('id') userId: string) {
    return this.deactivateUserUseCase.execute(userId);
  }
}
