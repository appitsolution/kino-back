// user-roles.decorator.ts

import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const UserRoles = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;
    return user ? user.roles : [];
  },
);
