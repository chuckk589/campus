import { RetrieveUserDto } from './dto/retrieve-user.dto';
import { Injectable } from '@nestjs/common';
import { User } from '../mikroorm/entities/User';
import { UserRestriction } from '../mikroorm/entities/UserRestriction';
import { ReqUser } from 'src/types/interfaces';
import { EntityManager } from '@mikro-orm/mysql';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findAll(user: ReqUser): Promise<RetrieveUserDto[]> {
    // const users = await this.em.find(User, {  });
    //select all users who have at least 1 attempt with code created by user
    const users = await this.em
      .createQueryBuilder(User, 'u')
      .select('u.*')
      .from(User)
      .where(
        user.hasAdminRights()
          ? 'true'
          : `u.id IN (SELECT DISTINCT user_id FROM quiz_attempt WHERE code_id IN (SELECT id FROM code WHERE created_by_id = ${user.id}))`,
      )
      .getResultList();
    const restrictions = await this.em.find(UserRestriction, {});
    return users.map((user: User) => {
      const userRestriction = restrictions.find((restriction) => restriction.userId == user.userId);
      return new RetrieveUserDto(user, userRestriction ? true : false);
    });
  }
}
