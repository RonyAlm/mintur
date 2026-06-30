import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { RequestWithUser } from '../../modules/auth/infrastructure/controllers/auth.controller';

export const Activeuser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<RequestWithUser>();
    return request.user;
  },
);
