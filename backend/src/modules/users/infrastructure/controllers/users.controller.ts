import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from '../../applications/dtos';
import { PrismaUsersRepository } from '../persistence';

@Controller('users')
export class UsersController {
  constructor(private readonly prismaUserRepository: PrismaUsersRepository) {}

  @Get()
  getAllUsers() {
    return this.prismaUserRepository.findAll();
  }

  // @Get(':id')
  // getUserById(@Param('id') id: string): User {
  //   return this.usersService.getUserById(id);
  // }

  // @Post()
  // createUser(@Body() user: CreateUserDto) {
  //   return this.usersService.create(user);
  // }

  // @Delete(':id')
  // deleteUser(@Param('id') id: string) {
  //   return this.usersService.deleteUser(id);
  // }

  // @Patch(':id')
  // updateUser(@Param('id') id: string, @Body() updatedFields: UpdateUserDto) {
  //   return this.usersService.updateUser(id, updatedFields);
  // }
}
