import { CanActivate, ExecutionContext, UseGuards } from '@nestjs/common';

export function Permissions(permissions: string[] | null) {
  class PermissionGuard implements CanActivate {
    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!permissions || permissions.length === 0) return true;
      const request = context.switchToHttp().getRequest();
      const user = request.session?.passport?.user;
      if (!user || !permissions.every((permission) => user.permissions.includes(permission))) return false;
      return true;
    }
  }
  return UseGuards(PermissionGuard);
}
