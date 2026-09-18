import { applyDecorators, UseGuards } from '@nestjs/common';
import { AuthGuard } from '../../modules/auth/infrastructure/guards';
import { Role } from '../../modules/users/domain/entities';
import { Roles } from './roles.decorator';
import { RolesGuard } from '../guards/roles.guard';

export function Auth(role: Role) {
  return applyDecorators(Roles(role), UseGuards(AuthGuard, RolesGuard));
}
