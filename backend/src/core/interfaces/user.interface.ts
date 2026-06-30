import { Role } from 'src/modules/users/domain';

export interface ExecutorUser {
  id: string;
  email: string;
  role: Role;
}
