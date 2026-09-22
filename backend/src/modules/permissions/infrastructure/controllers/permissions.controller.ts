import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreatePermissionDto } from '../../applications/dtos';
import {
  CreatePermissionUseCase,
  GetPermissionByIdUseCase,
  ListPermissionsUseCase,
} from '../../applications/use-cases';
import { Auth } from '../../../../core/decorators';

@Controller('permissions')
export class PermissionsController {
  constructor(
    private readonly createPermissionUseCase: CreatePermissionUseCase,
    private readonly getPermissionByIdUseCase: GetPermissionByIdUseCase,
    private readonly listPermissionsUseCase: ListPermissionsUseCase,
  ) {}

  @Get('')
  @Auth('permissions:read')
  getAllPermissions() {
    return this.listPermissionsUseCase.execute();
  }

  @Get(':id')
  @Auth('permissions:read')
  getPermissionById(@Param('id') id: string) {
    return this.getPermissionByIdUseCase.execute(id);
  }

  @Post('')
  @Auth('permissions:create')
  createPermission(@Body() dto: CreatePermissionDto) {
    return this.createPermissionUseCase.execute(dto);
  }
}
