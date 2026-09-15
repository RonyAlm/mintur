import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import {
  CreateRoleDto,
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
  UpdateRoleDto,
  UpdateRoleUseCase,
  AssignPermissionToRoleUseCase,
  RemovePermissionFromRoleUseCase,
  AssignPermissionToRoleDto,
  RemovePermissionFromRoleDto,
} from '../../application';

@Controller('roles')
export class RolesController {
  constructor(
    private readonly createRoleUseCase: CreateRoleUseCase,
    private readonly getRoleByIdUseCase: GetRoleByIdUseCase,
    private readonly listRolesUseCase: ListRolesUseCase,
    private readonly updateRoleUseCase: UpdateRoleUseCase,
    private readonly assignPermissionToRoleUseCase: AssignPermissionToRoleUseCase,
    private readonly removePermissionFromRoleUseCase: RemovePermissionFromRoleUseCase,
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

  @Post(':roleId/permissions')
  assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionToRoleDto,
  ) {
    return this.assignPermissionToRoleUseCase.execute({ ...dto, roleId });
  }

  @Delete(':roleId/permissions/:permissionId')
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    const dto: RemovePermissionFromRoleDto = { roleId, permissionId };
    return this.removePermissionFromRoleUseCase.execute(dto);
  }
}
