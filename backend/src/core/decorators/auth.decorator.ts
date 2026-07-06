import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../modules/users/domain/entities';
import { Roles } from './roles.decorator';
import { AuthGuard } from '../../modules/auth/infrastructure/guard';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(role: Role) {
  return applyDecorators(Roles(role), UseGuards(AuthGuard, RolesGuard));
}
