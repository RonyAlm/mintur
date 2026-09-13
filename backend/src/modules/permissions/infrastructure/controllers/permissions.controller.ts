import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePermissionDto } from '../../applications/dtos';
import {
  CreatePermissionUseCase,
  GetPermissionByIdUseCase,
  ListPermissionsUseCase,
} from '../../applications/use-cases';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
  ) {}

  @Get('')
  //   @Auth(Role.ADMIN)
  getAllPermissions() {
    return this.listPermissionsUseCase.execute();
  }

  @Get(':id')
  getPermissionById(@Param('id') id: string) {
    return this.getPermissionByIdUseCase.execute(id);
  }

  @Post('')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }

  //   @Patch(':id')
  //   updateRole(@Param('id') id: string, @Body() dto: UpdateRoleDto) {
  //     return this.updateRoleUseCase.execute(id, dto);
  //   }
}
