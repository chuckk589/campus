import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppConfigService } from '../app-config/app-config.service';
import { compare } from 'bcrypt';
import { Config } from '../mikroorm/entities/Config';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService, private readonly em: EntityManager) {}

  async validateUser(pass: string): Promise<any> {
    const password = await this.em.findOne(Config, { name: 'ADMIN_PASSCODE' });
    const valid = await compare(pass, password.value);
    return valid && { username: 'admin' };
  }

  async validateVersion(version: string): Promise<boolean> {
    const existingVersion = await this.em.findOne(Config, { name: 'VERSION' });
    return existingVersion.value == version;
  }

  async login(user: { username: string }) {
    return {
      access_token: this.jwtService.sign(user),
    };
  }
}
