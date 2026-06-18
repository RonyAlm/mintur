import { Body, Controller, Get, Post, Request } from '@nestjs/common';
import { CreateUserDto } from '../../applications/dtos';
import { Role, Users } from '../../domain';
import { CreateUserUseCase } from '../../applications';

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
  async createUser(@Body() dto: CreateUserDto, @Request() req) {
    const executor = new Users(
      'd6534be2-8cf4-4ec4-b7b5-1cc976947151',
      'carlos@rony.com',
      'hash',
      'W Almiron',
      Role.ADMIN,
    );
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
