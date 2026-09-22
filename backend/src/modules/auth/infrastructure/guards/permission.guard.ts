import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolePermissionRepository } from '../../../../modules/permissions/domain';
import { RequestWithUser } from '../../../../core';
import { REQUIRED_PERMISSION_KEY } from '../decorators';

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly rolePermissionRepository: RolePermissionRepository,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermission = this.reflector.get<string>(
      REQUIRED_PERMISSION_KEY,
      context.getHandler(),
    );

    if (!requiredPermission) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuario no autenticado');
    }

    const permissions =
      await this.rolePermissionRepository.findPermissionsByRoleId(user.roleId);

    if (!permissions) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }

    const hasPermission = permissions.some(
      (permission) => permission.name === requiredPermission,
    );

    if (!hasPermission) {
      throw new ForbiddenException(
        'No tienes permiso para realizar esta acción',
      );
    }

    return hasPermission;
  }
}
