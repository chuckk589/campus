import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Config } from '../mikroorm/entities/Config';
import { Owner } from '../mikroorm/entities/Owner';
import { ReqUser, ReqUserRaw } from 'src/types/interfaces';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly em: EntityManager) {}

  async validateUser(payload: { username: string; password: string }): Promise<Owner | null> {
    const user = await this.em.getRepository(Owner).validateUser(payload.username, payload.password);
    return user;
  }
  // async register(payload: { username: string; password: string }): Promise<{ id: number; role: string; token: string }> {
  //   const user = await this.em.getRepository(Owner).createIfNotExists({ username: payload.username, password: payload.password });
  //   if (!user) {
  //     throw new HttpException('User already exists', 400);
  //   }
  //   await this.em.persistAndFlush(user);
  //   return this.login({ id: user.id, role: user.role, username: user.username });
  // }
  async validateUserStatus(attemptId: number): Promise<any> {
    const restriction = await this.em
      .getConnection()
      .execute(
        'SELECT * FROM user_restriction WHERE user_id = (SELECT user_id FROM user WHERE id = (SELECT user_id FROM quiz_attempt WHERE id =?))',
        [attemptId],
      );
    if (restriction.length > 0) {
      return false;
    }
    return true;
  }

  async validateVersion(version: string): Promise<boolean> {
    const existingVersion = await this.em.findOne(Config, { name: 'VERSION' });
    return existingVersion.value == version;
  }
  async validateRole(user: ReqUser, allowedRoles: string[]): Promise<boolean> {
    const entity = await this.em.findOne(Owner, { id: user.id }, { refresh: true });
    if (!entity) {
      return false;
    }
    return allowedRoles.includes(entity.role);
  }

  async login(user: ReqUserRaw): Promise<ReqUserRaw & { token: string }> {
    return {
      ...user,
      token: this.jwtService.sign(user),
    };
  }
}
