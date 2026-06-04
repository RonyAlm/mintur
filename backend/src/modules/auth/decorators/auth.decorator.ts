import { applyDecorators, UseGuards } from '@nestjs/common';
import { Role } from '../../../modules/users/domain/entities';
import { Roles } from './roles.decorator';
import { AuthGuard, RolesGuard } from '../guard';

export function Auth(role: Role) {
  return applyDecorators(Roles(role), UseGuards(AuthGuard, RolesGuard));
}
