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
  CreateRoleUseCase,
  GetRoleByIdUseCase,
  ListRolesUseCase,
  UpdateRoleUseCase,
  AssignPermissionToRoleUseCase,
  RemovePermissionFromRoleUseCase,
} from '../../application';
import { Auth } from '../../../../core/decorators';
import {
  AssignPermissionToRoleDto,
  CreateRoleDto,
  UpdateRoleDto,
  RemovePermissionFromRoleDto,
} from './dtos';

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
  @Auth('roles:read')
  getAllRoles() {
    return this.listRolesUseCase.execute();
  }

  @Get(':id')
  @Auth('roles:read')
  getRoleById(@Param('id') id: string) {
    return this.getRoleByIdUseCase.execute(id);
  }

  @Post('')
  @Auth('roles:create')
  createRole(@Body() dto: CreateRoleDto) {
    return this.createRoleUseCase.execute(dto);
  }

  @Patch(':id')
  @Auth('roles:update')
  updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
    return this.updateRoleUseCase.execute(id, dto);
  }

  @Post(':roleId/permissions')
  @Auth('roles:manage_permissions')
  assignPermissionToRole(
    @Param('roleId') roleId: string,
    @Body() dto: AssignPermissionToRoleDto,
  ) {
    return this.assignPermissionToRoleUseCase.execute({
      roleId,
      permissionId: dto.permissionId,
    });
  }

  @Delete(':roleId/permissions/:permissionId')
  @Auth('roles:manage_permissions')
  removePermissionFromRole(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    const dto: RemovePermissionFromRoleDto = { roleId, permissionId };
    return this.removePermissionFromRoleUseCase.execute(dto);
  }
}
