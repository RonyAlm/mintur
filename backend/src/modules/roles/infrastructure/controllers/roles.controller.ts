import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import {
  CreateRoleDto,
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
} from '../../application';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
  ) {}

  @Get('')
  //   @Auth(Role.ADMIN)
  getAllRoles() {
    return this.listRolesUseCase.execute();
  }

  @Get(':id')
  getRoleById(@Param('id') id: string) {
    return this.getRoleByIdUseCase.execute(id);
  }

  @Post('')
  createRole(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }
}
