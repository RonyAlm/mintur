import { Role } from 'src/modules/users/domain';

export interface ExecutorUser {
  sub: string;
  email: string;
  role: Role;
}
