import { SetMetadata } from '@nestjs/common';
import { Role } from '../../../modules/users/domain/entities';

export const ROLE_KEY = 'roles';
export const Roles = (roles: Role) => SetMetadata(ROLE_KEY, roles);
