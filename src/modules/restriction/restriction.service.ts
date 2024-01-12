import { RetrieveRestrictionDto } from './dto/retrieve-restriction.dto';
import { EntityManager } from '@mikro-orm/core';
import { HttpException, Injectable } from '@nestjs/common';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';
import { UpdateRestrictionDto } from './dto/update-restriction.dto';
import { CreateRestrictionDto } from './dto/create-restriction.dto';
import { User } from '../mikroorm/entities/User';

@Injectable()
export class RestrictionService {
  constructor(private readonly em: EntityManager) {}

  async remove(ids: number[]) {
    const restrictions = await this.em.find(UserRestriction, { id: { $in: ids } });
    restrictions.map((restriction) => this.em.remove(restriction));
    await this.em.flush();
    return restrictions.map((restriction) => restriction.id);
  }

  async create(createRestrictionDto: CreateRestrictionDto) {
    const restriction = await this.em.findOne(UserRestriction, { userId: createRestrictionDto.userId });
    if (restriction) {
      throw new HttpException('User already restricted', 400);
    } else {
      const user = await this.em.findOne(User, { userId: createRestrictionDto.userId });

      const restriction = this.em.create(UserRestriction, {
        name: user?.name,
        login: user?.login,
        reason: createRestrictionDto.reason,
        userId: createRestrictionDto.userId,
      });
      await this.em.persistAndFlush(restriction);
      return new RetrieveRestrictionDto(restriction);
    }
  }

  async update(id: number, updateRestrictionDto: UpdateRestrictionDto) {
    const restriction = await this.em.findOne(UserRestriction, { id });
    restriction.reason = updateRestrictionDto.reason;
    await this.em.persistAndFlush(restriction);
    return new RetrieveRestrictionDto(restriction);
  }

  async findAll() {
    const restrictions = await this.em.find(UserRestriction, {});
    return restrictions.map((restriction) => new RetrieveRestrictionDto(restriction));
  }
}
