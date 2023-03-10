import { EntityManager, wrap } from '@mikro-orm/core';
import { Injectable } from '@nestjs/common';
import { User } from '../mikroorm/entities/User';

@Injectable()
export class UserService {
  constructor(private readonly em: EntityManager) {}

  async findAll(): Promise<User[]> {
    const users = await this.em.find(User, {});
    return users;
  }

  // async update(id: number, updateUserDto: UpdateUserDto) {
  //   const user = await this.em.findOne(User, id);
  //   user.credentials = updateUserDto.credentials;
  //   user.locale = updateUserDto.locale;
  //   user.promo = this.em.getReference(Promo, Number(updateUserDto.promo));
  //   user.role = updateUserDto.role;
  //   user.city = this.em.getReference(City, Number(updateUserDto.city));
  //   user.phone = updateUserDto.phone;
  //   user.registered = updateUserDto.registered;
  //   await this.em.persistAndFlush(user);
  //   return new RetrieveUserDto(user);
  // }
}
