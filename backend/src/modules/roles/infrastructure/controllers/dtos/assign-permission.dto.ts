import { IsNotEmpty, IsUUID } from 'class-validator';

export class AssignPermissionToRoleDto {
  @IsUUID()
  @IsNotEmpty()
  permissionId!: string;
}
