import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { CurrentUser } from '../types/current-user';
import { GoogleUser } from '../types/google-user';

export const User = createParamDecorator((_, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return user as CurrentUser;
});

export const UserGoogle = createParamDecorator((_, ctx: ExecutionContext) => {
  const { user } = ctx.switchToHttp().getRequest();
  return user as GoogleUser;
});
