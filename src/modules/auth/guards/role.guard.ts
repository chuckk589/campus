import { CanActivate, ExecutionContext, Inject, Injectable, UseGuards } from '@nestjs/common';
import { AuthService } from '../auth.service';
/**
Must be first guard
*/
export function Roles(roles: string[] | null) {
  class RolesGuard implements CanActivate {
    constructor(@Inject(AuthService) private readonly authService: AuthService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      if (!roles || roles.length === 0) return true;
      const request = context.switchToHttp().getRequest();
      const user = request.user;
      return await this.authService.validateRole(user, roles);
    }
  }
  return UseGuards(RolesGuard);
}
