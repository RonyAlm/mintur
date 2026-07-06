import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { CreateUserDto } from '../../applications/dtos';
import { Role } from '../../domain';
import { CreateUserUseCase } from '../../applications';
import { Activeuser, type ExecutorUser } from '../../../../core';
import { Auth } from '../../../../core/decorators';

@Controller('users')
export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase) {}

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
    return this.createUserUseCase.execute(dto, executor);
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
