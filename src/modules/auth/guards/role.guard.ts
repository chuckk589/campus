import { CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';

export function Roles(roles: string[] | null) {
  class RolesGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!roles || roles.length === 0) return true;
      const request = context.switchToHttp().getRequest();
      const user = request.session?.passport?.user;
      if (!user || !roles.includes(user.role)) return false;
      return true;
    }
  }
  return UseGuards(RolesGuard);
}
