import { IsNotEmpty, IsUUID } from 'class-validator';

export class RemovePermissionFromRoleDto {
  @IsUUID()
  @IsNotEmpty()
  roleId!: string;

  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}
