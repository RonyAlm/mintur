import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import {
  CreateRoleDto,
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
  UpdateRoleDto,
  UpdateRoleUseCase,
} from '../../application';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
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

  @Patch(':id')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, dto);
  }
}
