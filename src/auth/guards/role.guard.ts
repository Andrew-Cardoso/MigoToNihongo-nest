import { CanActivate, ExecutionContext, mixin, Type } from '@nestjs/common';
import { Role } from '@prisma/client';
import { RolesEnum } from '../constants/roles';

export const RoleGuard = (...roles: RolesEnum[]): Type<CanActivate> => {
  class RoleGuardMixin implements CanActivate {
    canActivate(context: ExecutionContext) {
      const userRoles: Role[] =
        context.switchToHttp().getRequest().user?.roles ?? [];

      return roles?.some((role) =>
        userRoles.some(({ id }) => RolesEnum[role] === id),
      );
    }
  }

  const guard = mixin(RoleGuardMixin);
  return guard;
};
