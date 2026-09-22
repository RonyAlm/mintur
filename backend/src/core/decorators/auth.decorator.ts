import { applyDecorators, UseGuards } from '@nestjs/common';
import {
  JwtAuthGuard,
  PermissionGuard,
} from '../../modules/auth/infrastructure/guards';
import { RequirePermission } from '../../modules/auth/infrastructure/decorators';

export function Auth(permission: string) {
  return applyDecorators(
    RequirePermission(permission),
    UseGuards(JwtAuthGuard, PermissionGuard),
  );
}
