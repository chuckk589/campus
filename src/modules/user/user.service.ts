import { RetrieveUserDto } from './dto/retrieve-user.dto';
import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../mikroorm/entities/User';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findAll() {
    //select user and child restrictions as a single result set
    const users = await this.em.find(User, {});
    const restrictions = await this.em.find(UserRestriction, {});
    return users.map((user) => {
      const userRestriction = restrictions.find((restriction) => restriction.userId == user.userId);
      return new RetrieveUserDto(user, userRestriction);
    });
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.em.findOne(User, id);
    let restriction = await this.em.findOne(UserRestriction, { userId: user.userId });
    if (updateUserDto.isBanned === true) {
      if (!restriction) {
        restriction = this.em.create(UserRestriction, { reason: updateUserDto.banReason, userId: user.userId });
      } else {
        restriction.reason = updateUserDto.banReason;
      }
      await this.em.persistAndFlush(restriction);
    } else if (restriction) {
      await this.em.removeAndFlush(restriction);
      restriction = null;
    }

    return new RetrieveUserDto(user, restriction);
  }
}
