import { Role } from 'src/modules/users/domain';
import { Request } from 'express';

export interface ExecutorUser {
  sub: string;
  email: string;
  role: Role;
}

export interface RequestWithUser extends Request {
  user: {
    id: string;
    email: string;
    roleId: string;
  };
}
