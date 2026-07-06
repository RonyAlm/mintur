import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../modules/users/domain/entities';
import { ROLE_KEY } from '../decorators';
import { RequestWithUser } from '../../modules/auth/infrastructure/controllers/auth.controller';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const rol = this.reflector.getAllAndOverride<Role>(ROLE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!rol) return true;

    const { user } = context.switchToHttp().getRequest<RequestWithUser>();

    if (user.role === Role.ADMIN) return true;

    return rol === user.role;
  }
}
