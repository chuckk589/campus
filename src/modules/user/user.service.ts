import { RetrieveUserDto } from './dto/retrieve-user.dto';
import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../mikroorm/entities/User';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<RetrieveUserDto[]> {
    const users = await this.em.find(User, {}, { populate: ['restriction'] });
    return users.map((user) => new RetrieveUserDto(user));
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.em.findOne(User, id, { populate: ['restriction'] });
    if (updateUserDto.isBanned === true) {
      if (user.restriction == null) {
        user.restriction = this.em.create(UserRestriction, { reason: updateUserDto.banReason });
      } else {
        user.restriction.reason = updateUserDto.banReason;
      }
    } else {
      user.restriction = null;
    }
    await this.em.persistAndFlush(user);
    return new RetrieveUserDto(user);
  }
}
