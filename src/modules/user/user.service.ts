import { RetrieveUserDto } from './dto/retrieve-user.dto';
import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../mikroorm/entities/User';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<RetrieveUserDto[]> {
    const users = await this.em.find(User, {});
    const restrictions = await this.em.find(UserRestriction, {});
    return users.map((user) => {
      const userRestriction = restrictions.find((restriction) => restriction.userId == user.userId);
      return new RetrieveUserDto(user, userRestriction ? true : false);
    });
  }
}
