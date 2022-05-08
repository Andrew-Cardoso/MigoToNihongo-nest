import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '@prisma/client';

export const RoleGuard = (...roles: Role[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const userRoles: Role[] =
        context.switchToHttp().getRequest().user?.roles ?? [];
      return roles?.some((role) => userRoles.includes(role));
    }
  }

  const guard = mixin(RoleGuardMixin);
  return guard;
};
